import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { cn } from "~/lib/utils";

export default function HeroHome() {
  const { t } = useTranslation("landing");

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero content */}
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="text-center">
            <h1
              className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--foreground),var(--sidebar-border),var(--sidebar-primary),var(--sidebar-ring),var(--secondary-foreground))] bg-[length:200%_auto] bg-clip-text pb-5 font-nacelle text-4xl font-semibold text-transparent md:text-5xl"
              data-aos="fade-up"
            >
              {t("header")}
            </h1>
            <div className="mx-auto max-w-3xl">
              <p
                className="mb-8 text-xl text-muted-foreground"
                data-aos="fade-up"
                data-aos-delay={200}
              >
                {t("subtitle")}
              </p>
              <div className="flex gap-4 mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
                <div data-aos="fade-up" data-aos-delay={600}>
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

              <img src="/images/dragonHero.png" className="mt-10 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
