# Lesson 3: The Supabase Middleware

## 1. The context

We will create a context that watches the user's authentication state and updates the Supabase client accordingly.

If he logs out, we want to reset the client to avoid any unauthorized access.

```tsx
import { createContext, useContext, useState, useEffect } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import { Link } from "react-router";

const SupabaseAuthProviderContext = createContext<SupabaseClient | null>(null);

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
    <SupabaseAuthProviderContext.Provider value={supabase}>
      {children}
    </SupabaseAuthProviderContext.Provider>
  );
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

export const useSession = () => {
  const context = useContext(SupabaseAuthProviderContext);
  if (context === null) {
    throw new Error(
      "useSession must be used within a SupabaseAuthProviderContext"
    );
  }
  return context.session;
};
```

## 2. Wrap your application with the provider

You might only want to wrap the part of your application that requires authentication.

```tsx
import { SupabaseAuthProvider } from "./SupabaseAuthProvider";

function App() {
  return (
    <SupabaseAuthProvider>
      <YourProtectedComponent />
    </SupabaseAuthProvider>
  );
}
```
