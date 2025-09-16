import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

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

  layout("auth/layout.tsx", [
    route("dashboard", "pages/dashboard/index.tsx"),
    layout("auth/admin.tsx", [
      route("admin", "pages/admin/index.tsx"),
      route("admin/books", "pages/admin/books/index.tsx"),
      route("admin/books/new", "pages/admin/books/new.tsx"),

      route("admin/categories", "pages/admin/categories/index.tsx"),
      route("admin/categories/new", "pages/admin/categories/new.tsx"),

      route("admin/book-categories", "pages/admin/booksCategories/index.tsx"),
      route("admin/book-categories/new", "pages/admin/booksCategories/new.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
