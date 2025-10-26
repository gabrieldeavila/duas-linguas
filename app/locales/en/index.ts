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
import alert from "./alert";

export default {
  notFound,
  landing,
  translation,
  zod,
  fields,
  login,
  general,
  alert,
  pages,
  dashboard,
} satisfies Resource;
