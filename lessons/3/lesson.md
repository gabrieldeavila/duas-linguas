# Lesson 3: The Supabase Middleware

## 1. The context

We will create a context that watches the user's authentication state and updates the Supabase client accordingly.

If he logs out, we want to reset the client to avoid any unauthorized access.

```tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { supabase } from "~/lib/supabase";
import type { SupabaseAuthProviderType } from "~/types/internal.types";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

const SupabaseAuthProviderContext =
  createContext<SupabaseAuthProviderType | null>(null);

export type SupabaseAuthProviderType = {
  supabase: SupabaseClient;
  session: Session | null;
};

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

## 2. Create a Layout

The layout will include the `SupabaseAuthProvider`. This will ensure that all components within the layout have access to the Supabase client and the user's session.

Create a new file: `app/auth/layout.tsx`.

I already included a sidebar component in the layout.

```tsx
import { Outlet } from "react-router";
import { AppSidebar } from "~/components/internal/sidebar/app-sidebar";
import { ToggleSidebar } from "~/components/internal/sidebar/toggleSidebar";
import { SupabaseAuthProvider } from "~/components/internal/supabaseAuth";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

function Layout() {
  return (
    <SupabaseAuthProvider>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          <div
            className={cn(
              "group-data-[view=desktop]/sidebar-wrapper:hidden",
              "px-2 w-fit"
            )}
          >
            <ToggleSidebar />
          </div>

          <div className="px-4 sm:py-4">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SupabaseAuthProvider>
  );
}

export default Layout;
```
## 3. Add routes to the layout
We can now say which routes require authentication and which do not.

Go to the `app/routes.tsx` file and update it as follows:

```tsx
import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  route("api/locales/:lng/:ns", "./api/locales.ts"),

  index("pages/home/index.tsx"),
  route("developer", "pages/developer/index.tsx"),
  route("platform", "pages/platform/index.tsx", [
    route("docs", "pages/platform/docs/index.tsx"),
    route("docs/:id", "pages/platform/docs/[id].tsx"),
  ]),
  route("signin", "pages/signin/index.tsx"),
  route("signup", "pages/signup/index.tsx"),

  layout("auth/layout.tsx", [
    route("dashboard", "pages/dashboard/index.tsx"),
  ]),
] satisfies RouteConfig;

```

For every route that requires authentication, we add it inside the `layout` parameter.
