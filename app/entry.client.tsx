import Fetch from "i18next-fetch-backend";
import i18next from "i18next";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { HydratedRouter } from "react-router/dom";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { z } from "zod";

async function main() {
  await i18next
    .use(initReactI18next)
    .use(Fetch)
    .use(I18nextBrowserLanguageDetector)
    .init({
      fallbackLng: "en",
      detection: { order: ["htmlTag"], caches: [] },
      backend: { loadPath: "/api/locales/{{lng}}/{{ns}}" },
    });

  z.config({
    customError: (issue) => {
      const message = i18next.t(`zod:errors.${issue.code}`, {
        path: issue.path,
        minimum: issue.minimum,
        expected: issue.expected,
        received: issue.received,
        multiple: issue.divisor,
        format: issue.format,
        keys: issue.keys?.join(", "),
        input: issue.input,
      });

      if (message) {
        return {
          message,
        };
      }

      return null;
    },
  });

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <HydratedRouter />
        </StrictMode>
      </I18nextProvider>
    );
  });
}

main().catch((error) => console.error(error));
