import {
  LibraryBig,
  Mouse,
  PenIcon,
  Settings,
  Target,
  WifiOff,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Features() {
  const { t } = useTranslation("landing");

  return (
    <section className="relative">
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 -mt-20 -translate-x-1/2"
        aria-hidden="true"
      ></div>
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -mb-80 -translate-x-[120%] opacity-50"
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t py-12 [border-image:linear-gradient(to_right,transparent,--theme(--border/.5),transparent)1] md:py-20">
          {" "}
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-12 text-center">
            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-[var(--muted)] after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-[var(--muted)]">
              <span className="inline-flex bg-linear-to-r from-[var(--sidebar-ring)] to-[var(--muted-foreground)] bg-clip-text text-transparent">
                {t("features.title")}
              </span>
            </div>
            <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--foreground),var(--sidebar-border),var(--sidebar-primary),var(--sidebar-ring),var(--secondary-foreground))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
              {t("features.subtitle")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("features.description")}
            </p>
          </div>
          <div className="flex justify-center pb-4 md:pb-12" data-aos="fade-up">
            {/* <Image
              className="max-w-none"
              src={FeaturesImage}
              width={1104}
              height={384}
              alt="Features"
            /> */}
            <img
              src="/images/dragonFeatures.png"
              className="w-full max-h-96 object-cover object-[center_70%] rounded-md"
              alt="Features"
            />
          </div>
          {/* Items */}
          <div className="mx-auto grid max-w-sm gap-12 sm:max-w-none sm:grid-cols-2 md:gap-x-14 md:gap-y-16 lg:grid-cols-3">
            <Item name="parallel" icon={<LibraryBig />} />
            <Item name="quizzes" icon={<PenIcon />} />
            <Item name="progress" icon={<Target />} />
            <Item name="difficulty" icon={<Settings />} />
            <Item name="immersive" icon={<Mouse />} />
            <Item name="offline" icon={<WifiOff />} />
          </div>
        </div>
      </div>
    </section>
  );
}

const Item = ({
  name,
  icon,
}: {
  name:
    | "parallel"
    | "quizzes"
    | "progress"
    | "difficulty"
    | "immersive"
    | "offline";
  icon: React.ReactNode;
}) => {
  const { t } = useTranslation("landing");

  return (
    <article>
      <div className="mb-3 text-[var(--sidebar-ring)]">{icon}</div>
      <h3 className="mb-1 font-nacelle text-[1rem] font-semibold text-foreground">
        {t(`features.${name}.title`)}
      </h3>
      <p className="text-muted-foreground">
        {t(`features.${name}.description`)}
      </p>
    </article>
  );
};
