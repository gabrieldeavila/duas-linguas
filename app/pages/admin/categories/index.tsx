import TableBuilder from "~/components/internal/table/builder";
import type { TableColumn } from "~/types/table.types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLinkRouter,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { useTranslation } from "react-i18next";

export function meta() {
  return [
    { title: "Categories" },
    { name: "description", content: "Welcome to the Categories Section!" },
  ];
}

const CATEGORIES_COLUMNS: TableColumn<"categories">[] = [
  {
    id: "id",
    name: "id",
    label: "ID",
    show: false,
  },
  {
    id: "name",
    name: "name",
    label: "Name",
  },
  {
    id: "language",
    name: "language",
    label: "Language",
  },
];

const TABLE_NAME = "categories" as const;

function Categories() {
  const { t } = useTranslation("pages");

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLinkRouter to="/admin">Admin</BreadcrumbLinkRouter>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbPage>{t("categories.title")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <TableBuilder<typeof TABLE_NAME>
        columns={CATEGORIES_COLUMNS}
        tableName={TABLE_NAME}
      />
    </div>
  );
}

export default Categories;
