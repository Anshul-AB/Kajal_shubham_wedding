import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

function isValidSupabaseUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" ||
      (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))
    );
  } catch {
    return false;
  }
}

export const supabaseConfigError =
  !supabaseUrl || !supabaseAnonKey
    ? "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment."
    : !isValidSupabaseUrl(supabaseUrl)
      ? "VITE_SUPABASE_URL must be a valid HTTPS Supabase project URL."
      : "";

export const supabase =
  !supabaseConfigError
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
