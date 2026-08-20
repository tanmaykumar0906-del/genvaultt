// lib/supabase/server.ts
// Use this inside Route Handlers (app/api/**) and Server Components.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can be called from a Server Component where cookies
            // are read-only — safe to ignore if you have middleware
            // refreshing sessions (see middleware.ts).
          }
        },
      },
    }
  );
}

// Service-role client — bypasses RLS. Server-only. Never import this
// into anything that ships to the browser. Used for admin-privileged
// operations where you've already verified the caller is an admin.
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
