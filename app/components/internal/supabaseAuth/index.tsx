import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { supabase } from "~/lib/supabase";
import type { SupabaseAuthProviderType } from "~/types/internal.types";

const SupabaseAuthProviderContext =
  createContext<SupabaseAuthProviderType | null>(null);

export const SupabaseAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({ supabase, session }), [session]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return (
      <div>
        Please sign in to continue.
        <Link to="/signin">Sign In</Link>
      </div>
    );
  }

  return (
    <SupabaseAuthProviderContext.Provider value={value}>
      {children}
    </SupabaseAuthProviderContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SupabaseAuthProviderContext);
  if (context === null) {
    throw new Error(
      "useSession must be used within a SupabaseAuthProviderContext"
    );
  }
  return context.session;
};
