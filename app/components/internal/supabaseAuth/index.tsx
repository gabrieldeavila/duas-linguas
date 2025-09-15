import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Skeleton } from "~/components/ui/skeleton";
import { supabase } from "~/lib/supabase";
import { cn } from "~/lib/utils";
import { jwtDecode } from "jwt-decode";
import type { SupabaseAuthProviderType } from "~/types";

const SupabaseAuthProviderContext =
  createContext<SupabaseAuthProviderType | null>(null);

export const SupabaseAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation("general");

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const getUserRole = useCallback((session: Session) => {
    try {
      const jwt = jwtDecode<{ user_role: string }>(session.access_token);
      return jwt.user_role;
    } catch {
      return null;
    }
  }, []);

  const updateUserRole = useCallback(
    (session: Session) => {
      const userRole = getUserRole(session);
      console.log(userRole);
      setIsAdmin(userRole === "admin");
    },
    [getUserRole]
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      updateUserRole(session!);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUserRole(session!);

      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [updateUserRole]);

  const value = useMemo(
    () => ({ supabase, session, isAdmin }),
    [session, isAdmin]
  );

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
      <div className="h-dvh w-dvw flex items-center justify-center flex-col gap-4">
        <p>{t("mustSignIn")}</p>
        <div>
          <Link
            className={cn(
              "bg-primary",
              "rounded-lg",
              "btn-sm relative p-2",
              "whitespace-nowrap"
            )}
            to="/signin"
          >
            {t("signIn")}
          </Link>
        </div>
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

export const useUser = () => {
  const context = useContext(SupabaseAuthProviderContext);
  if (context === null) {
    throw new Error(
      "useUser must be used within a SupabaseAuthProviderContext"
    );
  }
  return context.session?.user;
};

export const useSupabase = () => {
  const context = useContext(SupabaseAuthProviderContext);
  if (context === null) {
    throw new Error(
      "useSupabase must be used within a SupabaseAuthProviderContext"
    );
  }
  return context.supabase;
};

export const useIsAdmin = () => {
  const context = useContext(SupabaseAuthProviderContext);
  if (context === null) {
    throw new Error(
      "useIsAdmin must be used within a SupabaseAuthProviderContext"
    );
  }

  return context.isAdmin;
};
