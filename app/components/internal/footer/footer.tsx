import type { FC } from "react";
import { Separator } from "~/components/ui/separator";
import { ModeToggle } from "~/components/mode-toggle"; // Botão para alternar o tema (você pode adaptar ou remover)

export const Footer: FC = () => {
  return (
    <footer className="border-t border-border bg-background text-sm text-muted-foreground mt-5">
      <div className="mx-auto w-full max-w-7xl px-6 py-10 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:justify-between gap-10">
          {/* Logo + Título */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <span>React Form Krafter</span>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="mb-2 font-medium text-foreground">Product</h4>
              <ul className="space-y-1">
                <li><a href="#" className="hover:underline">Changelog</a></li>
                <li><a href="#" className="hover:underline">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-foreground">Company</h4>
              <ul className="space-y-1">
                <li><a href="#" className="hover:underline">About</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-foreground">Contact</h4>
              <ul className="space-y-1">
                <li><a href="#" className="hover:underline">Discord</a></li>
                <li><a href="#" className="hover:underline">Twitter</a></li>
                <li><a href="#" className="hover:underline">GitHub</a></li>
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row md:justify-between items-center text-xs gap-4">
          <div>© 2025 Dissolutus. Free and Open Source.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
};
