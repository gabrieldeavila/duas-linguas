import type { Database } from "./database.types";

export type Views = {
  [K in keyof Database["public"]["Views"]]: {
    Row: Database["public"]["Views"][K]["Row"];
  };
};

export type Tables = Database["public"]["Tables"];

export type TablesAndViews = Tables & Views;

export type TableName = keyof TablesAndViews;
export type TableRowProps<T extends TableName> = TablesAndViews[T]["Row"];

export type TableColumn<T extends TableName> = {
  id: string;
  name: keyof TableRowProps<T>;
  label: string;
  show?: boolean;
};

export type TableSettingsProps<T extends TableName> = Partial<{
  hideAdd: boolean;
  limitHeight: boolean;
  columnSelector: keyof TableRowProps<T>;
  singleSelection: boolean;
  deleteItems: boolean;
  tableToDeleteFrom: keyof Tables;
  buttons: Partial<{
    title: string;
    buttonText: string;
  }>;
}>;

export type TableController<T extends TableName> = {
  selectedRows: (keyof TableRowProps<T>)[];
  selectedData: TableRowProps<T>[];
};

export type TableBuilderProps<T extends TableName> = {
  columns: TableColumn<T>[];
  tableName: T;
  to?: string;
  settings?: TableSettingsProps<T>;
  tableController?: React.RefObject<TableController<T> | null>;
};

export type BookProps = TableRowProps<"books">;
