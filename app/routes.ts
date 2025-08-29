import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("api/locales/:lng/:ns", "./api/locales.ts"),

  index("pages/home/index.tsx"),
  route("developer", "pages/developer/index.tsx"),
  route("platform", "pages/platform/index.tsx", [
    route("docs", "pages/platform/docs/index.tsx"),
    route("docs/:id", "pages/platform/docs/[id].tsx"),
  ]),
  route("signin", "pages/signin/index.tsx"),
  route("signup", "pages/signup/index.tsx"),
] satisfies RouteConfig;
