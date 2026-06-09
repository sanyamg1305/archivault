'use client'

import { createClient } from '@supabase/supabase-js'
import { useSession } from '@clerk/nextjs'

export function useSupabaseBrowser() {
  const { session } = useSession();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          // Native Integration: getToken() without a template name.
          const clerkToken = await session?.getToken({ template: 'supabase' });

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
