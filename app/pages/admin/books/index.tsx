import TableBuilder from "~/components/internal/table/builder";
import type { TableColumn } from "~/types/table.types";

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
    show: false
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
  return <TableBuilder<typeof TABLE_NAME> columns={BOOKS_COLUMNS} tableName={TABLE_NAME} />;
}

export default Books;
