import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export async function createClerkSupabaseClient() {
  const { getToken } = await auth();

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await getToken({ template: 'supabase' });

          const headers = new Headers(options?.headers);
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`);
          }

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}

// Service role client — bypasses RLS. Only use in server actions after verifying auth via Clerk.
export function createServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
