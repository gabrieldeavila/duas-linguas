import type { Resource } from "i18next";
import notFound from "./not-found";
import translation from "./translation";
import zod from "./zod";
import landing from "./landing";

export default { notFound, landing, translation, zod } satisfies Resource;
