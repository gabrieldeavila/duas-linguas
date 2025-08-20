import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { cn } from "~/lib/utils";

export default function Cta() {
  const { t } = useTranslation("landing");

  return (
    <section className={cn("relative overflow-hidden")}>
      <div
        className={cn(
          "pointer-events-none absolute bottom-0 left-1/2 -z-10 -mb-24 ml-20 -translate-x-1/2"
        )}
        aria-hidden="true"
      >
        {/* <Image
          className="max-w-none"
          src={BlurredShape}
          width={760}
          height={668}
          alt="Blurred shape"
        /> */}
      </div>
      <div className={cn("mx-auto max-w-6xl px-4 sm:px-6")}>
        <div
          className={cn(
            "bg-linear-to-r from-transparent via-muted/50 py-12 md:py-20"
          )}
        >
          <div className={cn("mx-auto max-w-3xl text-center")}>
            <h2
              className={cn(
                "animate-[gradient_6s_linear_infinite]",
                "bg-[linear-gradient(to_right,var(--foreground),var(--sidebar-border),var(--sidebar-primary),var(--sidebar-ring),var(--secondary-foreground))] ",
                "bg-[length:200%_auto] bg-clip-text pb-8 font-nacelle text-3xl font-semibold text-transparent md:text-4xl"
              )}
              data-aos="fade-up"
            >
              {t("cta")}
            </h2>
            <div
              className={cn(
                "mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center"
              )}
            >
              <div data-aos="fade-up" data-aos-delay={400}>
                <Link
                  to="/signup"
                  className={cn(
                    "bg-primary",
                    "rounded-lg",
                    "btn-sm relative p-3"
                  )}
                >
                  <span className="relative inline-flex items-center">
                    {t("tryIt")}
                    <span className="ml-1 tracking-normal text-white/50 transition-transform group-hover:translate-x-0.5">
                      -&gt;
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
