import TableBuilder from "~/components/internal/table/builder";
import type { TableColumn, TableSettingsProps } from "~/types/table.types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLinkRouter,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export function meta() {
  return [
    { title: "Books" },
    { name: "description", content: "Welcome to the Books Section!" },
  ];
}

const BOOKS_CATEGORIES_COLUMNS: TableColumn<"vw_book_categories">[] = [
  {
    id: "id",
    name: "id",
    label: "ID",
    show: false,
  },
  {
    id: "category_name",
    name: "category_name",
    label: "Category Name",
  },
  {
    id: "book_title",
    name: "book_title",
    label: "Book Title",
  },
];

const TABLE_NAME = "vw_book_categories" as const;

function BooksCategories() {
  const { t } = useTranslation("pages");
  const TABLE_SETTINGS: TableSettingsProps<"book_categories"> = useMemo(
    () => ({
      deleteItems: true,
      columnSelector: "id",
      tableToDeleteFrom: "book_categories",
      buttons: {
        title: t("book_categories.newTitle"),
        buttonText: t("book_categories.submitButton"),
      },
    }),
    [t]
  );

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLinkRouter to="/admin">Admin</BreadcrumbLinkRouter>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbPage>{t("book_categories.title")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <TableBuilder<typeof TABLE_NAME>
        columns={BOOKS_CATEGORIES_COLUMNS}
        tableName={TABLE_NAME}
        to="/admin/book-categories"
        settings={TABLE_SETTINGS}
      />
    </div>
  );
}

export default BooksCategories;
