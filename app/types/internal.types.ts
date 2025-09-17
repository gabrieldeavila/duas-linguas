import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type SupabaseAuthProviderType = {
  supabase: SupabaseClient<Database>;
  session: Session | null;
  isAdmin: boolean;
};