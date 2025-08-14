import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("pages/welcome/index.tsx"),
  route("developer", "pages/developer/index.tsx"),
  route("platform", "pages/platform/index.tsx", [
    route("docs", "pages/platform/docs/index.tsx"),
    route("docs/:id", "pages/platform/docs/[id].tsx"),
  ]),
] satisfies RouteConfig;
