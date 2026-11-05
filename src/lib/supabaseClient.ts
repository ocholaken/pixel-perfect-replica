import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
  throw new Error("Missing Supabase configuration");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
