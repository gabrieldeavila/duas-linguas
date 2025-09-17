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

export function meta() {
  return [
    { title: "Books" },
    { name: "description", content: "Welcome to the Books Section!" },
  ];
}

const BOOKS_COLUMNS: TableColumn<"vw_book_categories">[] = [
  {
    id: "id",
    name: "id",
    label: "ID",
    show: false,
  },
  {
    id: "book_title",
    name: "book_title",
    label: "Book Title",
  },
  {
    id: "category_name",
    name: "category_name",
    label: "Category Name",
  },
];

const TABLE_NAME = "vw_book_categories" as const;

function Books() {
  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLinkRouter to="/admin">Admin</BreadcrumbLinkRouter>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbPage>Books Categories</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <TableBuilder<typeof TABLE_NAME>
        columns={BOOKS_COLUMNS}
        tableName={TABLE_NAME}
        to="/admin/book-categories/new"
        settings={{
          buttons: {
            title: "Add Book Category",
            buttonText: "Add",
          },
        }}
      />
    </div>
  );
}

export default Books;
