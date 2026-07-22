/**
 * Supabase browser client (client components). Uses the public anon key and the
 * SSR cookie bridge. Safe to import in "use client" components. Never import the
 * service-role key here — that lives server-side only.
 */

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Guest mode works without them.",
    );
  }
  return createBrowserClient(url, key);
}

/** Whether cloud saves are configured. Guest mode is always available. */
export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
