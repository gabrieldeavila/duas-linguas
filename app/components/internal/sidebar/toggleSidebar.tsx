import { PanelLeftIcon } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

export function ToggleSidebar({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Toggle Sidebar"
          onClick={toggleSidebar}
          className={cn(
            "flex group-data-[state=expanded]:justify-end",
            className
          )}
        >
          <PanelLeftIcon />
          <span className="sr-only">Toggle Sidebar</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
