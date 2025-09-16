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

export type TableSettingsProps<T extends TableName> = {
  hideAdd: boolean;
  limitHeight: boolean;
  columnSelector: keyof TableRowProps<T>;
  singleSelection: boolean;
};

export type TableBuilderProps<T extends TableName> = {
  columns: TableColumn<T>[];
  tableName: T;
  to?: string;
  settings?: Partial<TableSettingsProps<T>>;
};

export type BookProps = TableRowProps<"books">;
