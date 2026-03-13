import { createClient } from "@supabase/supabase-js";

import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

export function createBrowserSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
