import { Outlet } from "react-router";
import { SupabaseAuthProvider } from "~/components/internal/supabaseAuth";

function Layout() {
  return (
    <SupabaseAuthProvider>
      <Outlet />
    </SupabaseAuthProvider>
  );
}

export default Layout;
