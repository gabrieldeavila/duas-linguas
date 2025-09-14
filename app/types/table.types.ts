import type { Database } from "./database.types";

export type Tables = Database["public"]["Tables"];
export type TableName = keyof Tables;
export type TableRowProps<T extends TableName> = Tables[T]["Row"];

export type TableColumn<T extends TableName> = {
  id: string;
  name: keyof TableRowProps<T>;
  label: string;
  show?: boolean;
};

export type TableBuilderProps<T extends TableName> = {
  columns: TableColumn<T>[];
  tableName: T;
};

export type BookProps = TableRowProps<"books">;