// import WorflowImg01 from "@/public/images/workflow-01.png";
// import WorflowImg02 from "@/public/images/workflow-02.png";
// import WorflowImg03 from "@/public/images/workflow-03.png";
import { useTranslation } from "react-i18next";
import Spotlight from "./spotlight";

export default function Workflows() {
  const { t } = useTranslation("landing");

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-12 text-center">
            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-[var(--muted)] after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-[var(--muted)]">
              <span className="inline-flex bg-linear-to-r from-[var(--sidebar-ring)] to-[var(--muted-foreground)] bg-clip-text text-transparent">
                {t("tailored")}
              </span>
            </div>
            <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--foreground),var(--sidebar-border),var(--sidebar-primary),var(--sidebar-ring),var(--secondary-foreground))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
              {t("fluency")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("fluencyDescription")}
            </p>
          </div>
          {/* Spotlight items */}
          <Spotlight className="group mx-auto grid max-w-sm items-start gap-6 lg:max-w-none lg:grid-cols-3">
            <Card name="Immersive" />
            <Card name="Interactive" />
            <Card name="Experience" />
          </Spotlight>
        </div>
      </div>
    </section>
  );
}

const Card = ({
  name,
}: {
  name: "Immersive" | "Interactive" | "Experience";
}) => {
  const { t } = useTranslation("landing");

  return (
    <a
      className="group/card relative h-full overflow-hidden rounded-2xl bg-border p-px before:pointer-events-none before:absolute before:-left-40 before:-top-40 before:z-10 before:h-80 before:w-80 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:rounded-full before:bg-[var(--sidebar-ring)] before:opacity-0 before:blur-3xl before:transition-opacity before:duration-500 after:pointer-events-none after:absolute after:-left-48 after:-top-48 after:z-30 after:h-64 after:w-64 after:translate-x-[var(--mouse-x)] after:translate-y-[var(--mouse-y)] after:rounded-full after:bg-[var(--ring)] after:opacity-0 after:blur-3xl after:transition-opacity after:duration-500 hover:after:opacity-20 group-hover:before:opacity-100"
      href="#0"
    >
      <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-muted after:absolute after:inset-0  after:from-primary-foreground/25 after:via-muted/25 after:to-secondary/50">
        {/* Arrow */}
        <div
          className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--sidebar-primary)] text-primary opacity-0 transition-opacity group-hover/card:opacity-100"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={9}
            height={8}
            fill="none"
          >
            <path
              fill="#F4F4F5"
              d="m4.92 8-.787-.763 2.733-2.68H0V3.443h6.866L4.133.767 4.92 0 9 4 4.92 8Z"
            />
          </svg>
        </div>
        {/* Image */}
        {/* <Image
                  className="inline-flex"
                  src={WorflowImg01}
                  width={350}
                  height={288}
                  alt="Workflow 01"
                /> */}
        <img
          className="inline-flex"
          src={`/images/workflow/${name.toLowerCase()}.png`}
          width={350}
          height={288}
          alt="Workflow"
        />

        {/* Content */}
        <div className="p-6">
          <div className="mb-3">
            <span className="btn-sm relative rounded-full bg-ring/40 px-2.5 py-0.5 text-xs font-normal before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_bottom,--theme(--color-gray-700/.15),--theme(--color-gray-700/.5))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] hover:sidebar-primary/60">
              <span className="bg-linear-to-r from-card-foreground to-foreground bg-clip-text text-transparent">
                {t(`spotlight${name}.title`)}
              </span>
            </span>
          </div>
          <p className="text-muted-foreground">
            {t(`spotlight${name}.description`)}
          </p>
        </div>
      </div>
    </a>
  );
};
