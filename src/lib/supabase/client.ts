import { createBrowserClient } from "@supabase/ssr";
import {
  isSupabaseConfigured,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_URL,
} from "@/lib/env-public";

/**
 * Returns a browser Supabase client, or null when Supabase is not configured
 * (in which case the app runs in local demo mode).
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
