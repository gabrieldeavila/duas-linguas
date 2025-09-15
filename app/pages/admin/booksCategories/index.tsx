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

const BOOKS_COLUMNS: TableColumn<"book_categories">[] = [
  {
    id: "book_id",
    name: "book_id",
    label: "Book ID",
  },
  {
    id: "category_id",
    name: "category_id",
    label: "Category ID",
  },
];

const TABLE_NAME = "book_categories" as const;

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
            <BreadcrumbPage>Books</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <TableBuilder<typeof TABLE_NAME>
        columns={BOOKS_COLUMNS}
        tableName={TABLE_NAME}
      />
    </div>
  );
}

export default Books;
