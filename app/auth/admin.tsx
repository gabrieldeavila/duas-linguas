import { Outlet } from "react-router";
import {
  useIsAdmin
} from "~/components/internal/supabaseAuth";

function Layout() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

export default Layout;
