import { Home, Settings2, Shield, SquareLibrary } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from "~/components/ui/sidebar";
import { useIsAdmin } from "../supabaseAuth";

export function NavMain() {
  const { t } = useTranslation("general");
  const isAdmin = useIsAdmin();

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

        <SidebarMenuButton
          tooltip={t("your_library.title")}
          customComp={Link}
          to="/your-library"
        >
          <SquareLibrary />
          <span>{t("your_library.title")}</span>
        </SidebarMenuButton>

        <SidebarMenuButton
          tooltip={t("preferences.title")}
          customComp={Link}
          to="/preferences"
        >
          <Settings2 />
          <span>{t("preferences.title")}</span>
        </SidebarMenuButton>

        {isAdmin && (
          <SidebarMenuButton tooltip="Admin" customComp={Link} to="/admin">
            <Shield />
            <span>Admin</span>
          </SidebarMenuButton>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
