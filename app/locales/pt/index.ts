import type { Resource } from "i18next";
import notFound from "./not-found";
import translation from "./translation";
import zod from "./zod";
import landing from "./landing";
import fields from "./fields";
import login from "./login";
import general from "./general";
import pages from "./pages";
import dashboard from "./dashboard";

export default {
  notFound,
  translation,
  landing,
  zod,
  fields,
  login,
  general,
  pages,
  dashboard,
} satisfies Resource;
