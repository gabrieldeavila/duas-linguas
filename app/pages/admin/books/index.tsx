import TableBuilder from "~/components/internal/table/builder";

export function meta() {
  return [
    { title: "Books" },
    { name: "description", content: "Welcome to the Books Section!" },
  ];
}

const BOOKS_COLUMNS = [
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

const TABLE_NAME = "books";

function Books() {
  return <TableBuilder columns={BOOKS_COLUMNS} tableName={TABLE_NAME} />;
}

export default Books;
