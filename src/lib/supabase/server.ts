import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for server-side operations
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error: unknown) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            // Log the error for debugging purposes.
            if (error instanceof Error) {
              console.error(`Error setting cookie \'${name}\':`, error.message);
            } else {
              console.error(
                `An unknown error occurred while setting cookie \'${name}\':`,
                error
              );
            }
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Use `set` with an empty value and expired date to delete the cookie.
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch (error: unknown) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            // Log the error for debugging purposes.
            if (error instanceof Error) {
              console.error(
                `Error removing cookie \'${name}\':`,
                error.message
              );
            } else {
              console.error(
                `An unknown error occurred while removing cookie \'${name}\':`,
                error
              );
            }
          }
        },
      },
    }
  );
}
