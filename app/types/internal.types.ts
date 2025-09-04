import type { Session, SupabaseClient } from "@supabase/supabase-js";

export type SupabaseAuthProviderType = {
  supabase: SupabaseClient;
  session: Session | null;
};
