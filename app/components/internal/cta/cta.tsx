import { Button } from "~/components/ui/button";

export function CallToAction() {
  return (
    <section className="relative overflow-hidden rounded-md bg-muted/10 py-20 px-6 text-center shadow-lg">
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[200px] translate-y-[1rem] opacity-80 transition-all duration-500 ease-in-out group-hover:translate-y-[-2rem] group-hover:opacity-100">
        <div
          className="h-full w-full rounded-xl blur-2xl"
          style={{
            background:
              "linear-gradient(to top, var(--foreground) 0%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Get started
        </span>
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
          Start building with React Form Krafter
        </h2>
        <p className="max-w-xl text-sm text-muted-foreground">
          Get started with React Form Krafter and build amazing forms
        </p>
        <Button variant="default">Get Started</Button>
      </div>
    </section>
  );
}
