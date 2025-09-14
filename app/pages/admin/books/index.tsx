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

const BOOKS_COLUMNS: TableColumn<"books">[] = [
  {
    id: "id",
    name: "id",
    label: "ID",
    show: false,
  },
  {
    id: "title",
    name: "title",
    label: "Title",
  },
  {
    id: "author",
    name: "author",
    label: "Author",
  },
];

const TABLE_NAME = "books" as const;

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
