import type { Resource } from "i18next";
import notFound from "./not-found";
import translation from "./translation";
import zod from "./zod";
import landing from "./landing";
import fields from "./fields";
import login from "./login";

export default {
  notFound,
  landing,
  translation,
  zod,
  fields,
  login,
} satisfies Resource;
