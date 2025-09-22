import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type SupabaseAuthProviderType = {
  supabase: SupabaseClient<Database>;
  session: Session | null;
  isAdmin: boolean;
};

export type ExcerptTable = Database["public"]["Tables"]["excerpts"]["Row"];
export type QuestionTable = Database["public"]["Tables"]["questions"]["Row"];