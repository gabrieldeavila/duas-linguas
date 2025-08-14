import { CallToAction } from "~/components/internal/cta/cta";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import FormFeatures from "./formFeatures";

export function meta() {
  return [
    { title: "New React Form Krafter App" },
    { name: "description", content: "Welcome to React Form Krafter!" },
  ];
}

export default function Welcome() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="container mt-12 lg:mt-24 flex flex-col gap-16">
        <div className="flex flex-col gap-9">
          <h1
            className={cn(
              "scroll-m-20 text-left text-5xl font-extrabold tracking-wide text-balance",
              "max-w-2xl"
            )}
          >
            Every great product starts with a well-crafted form.
          </h1>

          <h3
            className={cn(
              "scroll-m-20 text-left text-lg font-semibold tracking-tight text-muted-foreground",
              "max-w-2xl"
            )}
          >
            A reusable, scalable form foundation built with React — define once,
            use everywhere, and keep your forms consistent and
            maintainable.{" "}
          </h3>

          <div className="flex items-center gap-4">
            <Button variant="default">Get Started</Button>
            <Button variant="ghost">GitHub</Button>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="max-w-2xl flex flex-col gap-4">
            <h2 className="scroll-m-20 text-4xl font-semibold tracking-tight text-center">
              It's all about the forms
            </h2>
            <p className="text-muted-foreground text-center">
              Forms are the backbone of any application, and with React Form
              Krafter, you can build them with ease. Whether it's a simple input
              or a complex multi-step form, our components are designed to be
              flexible and reusable.
            </p>
          </div>
        </div>

        <FormFeatures />

        <CallToAction />
      </div>
    </div>
  );
}
