import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `cookies().set()` method can throw an error when called from a Server Component or Server Action
          // that is initiated by a re-render in Next.js. This is a Next.js bug that will be fixed in a future version.
          // For now, we can ignore this error.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `cookies().set()` method can throw an error when called from a Server Component or Server Action
          // that is initiated by a re-render in Next.js. This is a Next.js bug that will be fixed in a future version.
          // For now, we can ignore this error.
        }
      },
    },
  })
}
