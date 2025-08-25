import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import Logo from "~/components/logo";
import { ModeToggle } from "~/components/mode-toggle";
import { cn } from "~/lib/utils";

export default function Header() {
  const { t } = useTranslation("landing");

  return (
    <header className="z-30 mt-2 w-full md:mt-5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className={cn(
            "bg-muted",
            "relative flex h-14 items-center justify-between gap-3 rounded-2xl px-3 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_right,var(--border),var(--muted-foreground),var(--accent))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] after:absolute after:inset-0 after:-z-10 after:backdrop-blur-xs"
          )}
        >
          {/* Site branding */}
          <div className="flex flex-1 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div
                className={cn(
                  "rounded-full overflow-hidden",
                  "h-10 w-10",
                  "flex items-center justify-center"
                )}
                style={{ backgroundColor: "#e9e5dc" }}
              >
                <Logo />
              </div>
            </Link>
          </div>

          {/* Desktop sign in links */}
          <ul className="flex flex-1 items-center justify-end gap-3">
            <li>
              <Link
                to="/signin"
                className={cn(
                  "bg-background",
                  "rounded-lg",
                  "whitespace-nowrap",
                  "btn-sm relative p-2"
                )}
              >
                {t("signIn")}
              </Link>
            </li>
            <li>
              <Link
                to="/signup"
                className={cn(
                  "bg-primary",
                  "rounded-lg",
                  "btn-sm relative p-2",
                  "whitespace-nowrap"
                )}
              >
                {t("signUp")}
              </Link>
            </li>
          </ul>
          <ModeToggle className="hidden lg:flex" />
        </div>
      </div>
    </header>
  );
}
