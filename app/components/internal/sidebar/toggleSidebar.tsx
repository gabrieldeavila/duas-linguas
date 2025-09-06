import { PanelLeftIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

export function ToggleSidebar({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar();
  const { t } = useTranslation("general");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={t("toggleSidebar")}
          onClick={toggleSidebar}
          className={cn(
            "flex group-data-[state=expanded]:justify-end",
            className
          )}
        >
          <PanelLeftIcon />
          <span className="sr-only">{t("toggleSidebar")}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
