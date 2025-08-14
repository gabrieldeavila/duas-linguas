import { Link } from "react-router";
import { cn } from "~/lib/utils";

function MobileNav({
  navbarBounds,
  setClose,
}: {
  navbarBounds: DOMRect | null;
  setClose: () => void;
}) {
  return (
    <div
      style={{
        top: navbarBounds ? navbarBounds.bottom : "auto",
      }}
      className={cn(
        "flex justify-center lg:hidden",
        "fixed bottom-0 left-0 right-0 z-100",
        "bg-background"
      )}
    >
      <div className="container flex flex-col p-4 shadow-lg">
        <ul className="space-y-2 flex flex-col gap-2">
          <li className="border-b pb-3 border-dashed">
            <Link className="flex w-full" to="/" onClick={setClose}>
              Platform
            </Link>
          </li>
          <li className="border-b pb-3 border-dashed">
            <Link className="flex w-full" to="/developer" onClick={setClose}>
              Developer
            </Link>
          </li>
          <li className="border-b pb-3 border-dashed">
            <Link className="flex w-full" to="/resources" onClick={setClose}>
              Resources
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default MobileNav;
