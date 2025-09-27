import { Outlet } from "react-router";
import Preferences from "~/components/internal/preferences";
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
        <Preferences />

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
