import type { Database } from "./database.types";

export type TableColumn = {
  id: string;
  name: string;
  label: string;
  show?: boolean;
};

export type TableBuilderProps = {
  columns: TableColumn[];
  tableName: keyof Database["public"]["Tables"];
};
