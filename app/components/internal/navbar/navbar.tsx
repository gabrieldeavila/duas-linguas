import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleIcon,
  Menu,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { ModeToggle } from "../../mode-toggle";
import MobileNav from "./mobile";
import { cn } from "~/lib/utils";

function Navbar() {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [navbarBounds, setNavbarBounds] = useState<DOMRect | null>(null);

  const handleNavbarRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setNavbarBounds(node.getBoundingClientRect());
    }
  }, []);

  return (
    <>
      <header
        ref={handleNavbarRef}
        className="w-full px-2 border-b flex items-center justify-center fixed top-0 z-50 bg-background"
      >
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <img src="/logo.png" alt="logo" className="h-6 w-6" />
              React Krafter
            </Link>

            <NavigationMenu viewport={false} className="hidden lg:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                            href="/"
                          >
                            <div className="mt-4 mb-2 text-lg font-medium">
                              shadcn/ui
                            </div>
                            <p className="text-muted-foreground text-sm leading-tight">
                              Beautifully designed components built with
                              Tailwind CSS.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem to="/platform/docs/krafter" title="Krafter">
                        The foundation for this template is built on React Form
                        Krafter
                      </ListItem>
                      <ListItem to="/platform/docs" title="React Router Dom">
                        Design your routes and navigation with ease.
                      </ListItem>
                      <ListItem
                        to="/platform/docs/typography"
                        title="Typography"
                      >
                        Styles for headings, paragraphs, lists...etc
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link to="/developer" className="px-4 py-2">
                      Developer
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="#" className="flex-row items-center gap-2">
                            <CircleHelpIcon />
                            Backlog
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="#" className="flex-row items-center gap-2">
                            <CircleIcon />
                            To Do
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="#" className="flex-row items-center gap-2">
                            <CircleCheckIcon />
                            Done
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/sign-in"
              className="text-sm font-medium hidden lg:inline-block"
            >
              Sign in
            </Link>

            <Button>
              <Link to="/get-started">Get Started</Link>
            </Button>

            <Button
              className="flex lg:hidden"
              variant="outline"
              size="icon"
              onClick={() => setShowMobileNav((prev) => !prev)}
            >
              <Menu
                className={cn(
                  "h-5 w-5 transition-all absolute",
                  showMobileNav
                    ? "scale-0 rotate-90 opacity-0"
                    : "scale-100 rotate-0 opacity-100"
                )}
              />
              {/* Close icon (X) */}
              <X
                className={cn(
                  "h-5 w-5 transition-all absolute",
                  showMobileNav
                    ? "scale-100 rotate-0 opacity-100"
                    : "scale-0 -rotate-90 opacity-0"
                )}
              />{" "}
            </Button>

            <ModeToggle className="hidden lg:flex" />
          </div>
        </div>
      </header>

      {showMobileNav && (
        <MobileNav
          setClose={() => setShowMobileNav(false)}
          navbarBounds={navbarBounds}
        />
      )}
    </>
  );
}

export default Navbar;

function ListItem({
  title,
  children,
  to,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { to: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link to={to}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
