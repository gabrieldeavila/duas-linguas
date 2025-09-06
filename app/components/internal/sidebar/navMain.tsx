import { Home, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from "~/components/ui/sidebar";

export function NavMain() {
  const { t } = useTranslation("general");

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("platform")}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuButton
          tooltip={t("home")}
          customComp={Link}
          to="/dashboard"
        >
          <Home />
          <span>{t("home")}</span>
        </SidebarMenuButton>

        <SidebarMenuButton tooltip="Admin" customComp={Link} to="/admin">
          <Shield />
          <span>Admin</span>
        </SidebarMenuButton>
      </SidebarMenu>
    </SidebarGroup>
  );
}
