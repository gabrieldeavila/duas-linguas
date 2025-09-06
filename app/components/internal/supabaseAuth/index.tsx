import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Skeleton } from "~/components/ui/skeleton";
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
    return (
      <div className="h-dvh w-dvw flex flex-wrap gap-3.5">
        <Skeleton className="h-full w-[50px]" />
        <div className="flex flex-col grow pt-2 pr-2 gap-2">
          <Skeleton className="h-[200px] w-full rounded-md" />
          <Skeleton className="h-[200px] w-full rounded-md" />
        </div>
      </div>
    );
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
