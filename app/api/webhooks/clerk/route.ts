import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
    }

    // Get the headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', { status: 400 })
    }

    const payload = await req.json()
    const body = JSON.stringify(payload)
    const wh = new Webhook(WEBHOOK_SECRET)
    let evt: WebhookEvent

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error occured', { status: 400 })
    }

    // Initialize Supabase with Service Role Key (to bypass RLS)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const eventType = evt.type

    // Handle User Creation/Update
    if (eventType === 'user.created' || eventType === 'user.updated') {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data
        const email = email_addresses[0]?.email_address

        const { error } = await supabase.from('profiles').upsert({
            id: id,
            email: email,
            first_name: first_name,
            last_name: last_name,
            avatar_url: image_url,
        })

        if (error) return new Response('Error updating profile', { status: 500 })
    }

    // Handle Organization Membership (Role Mapping)
    if (eventType === 'organizationMembership.created' || eventType === 'organizationMembership.updated') {
        const { organization, public_user_data, role } = evt.data;
        const userId = public_user_data.user_id;

        // 1. Map Clerk Role Identifiers to our Database Roles
        let archivaultRole: 'admin' | 'team_member' | 'client' = 'team_member';

        if (role === 'org:admin') {
            archivaultRole = 'admin';
        } else if (role === 'org:client') {
            archivaultRole = 'client';
        } else {
            // Default for org:member or any other custom team roles
            archivaultRole = 'team_member';
        }

        // 2. Store the role in the specific Membership table (The "Contextual" Role)
        // This is what RLS will use to protect project data.
        const { error: membershipError } = await supabase
            .from('organization_memberships')
            .upsert({
                id: evt.data.id, // The Clerk Membership ID
                organization_id: organization.id,
                user_id: userId,
                role: archivaultRole,
            });

        if (membershipError) console.error('Membership Sync Error:', membershipError);

        // 3. Update the main Profile table (The "Global" Role)
        // We do this so we can easily check their role in the UI without complex joins.
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: archivaultRole })
            .eq('id', userId);

        if (profileError) console.error('Profile Sync Error:', profileError);
    }

    return new Response('', { status: 200 })
}