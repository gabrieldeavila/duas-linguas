import type { Field } from "react-form-krafter";
import z from "zod";

export const schemaBookCategories = z.object({
  book: z.object({
    label: z.string().min(1, "Book is required"),
    id: z.string().min(1, "Book is required"),
  }),
  category: z.object({
    label: z.string().min(1, "Category is required"),
    id: z.string().min(1, "Category is required"),
  }),
});

export type SchemaBookCategories = typeof schemaBookCategories;
export type ValidatorBookCategories = z.infer<SchemaBookCategories>;

export const BOOK_CATEGORIES_FIELD: Field[] = [
  {
    name: "category",
    label: "category.label",
    placeholder: "category.placeholder",
    required: true,
    type: "modal",
    initialValue: "",
    wrapperClassName: "gap-3",
    metadata: {
      table: "categories",
      columnSelector: "id",
      columnLabel: "name",
      columns: [
        { id: "id", name: "id", label: "ID", show: false },
        { id: "name", name: "name", label: "Name" },
        { id: "description", name: "description", label: "Description" },
        { id: "language", name: "language", label: "Language" },
      ],
    },
  },
  {
    name: "book",
    label: "book.title",
    placeholder: "book.placeholder",
    required: true,
    type: "modal",
    initialValue: "",
    wrapperClassName: "gap-3",
    metadata: {
      table: "books",
      columnSelector: "id",
      columnLabel: "title",
      columns: [
        { id: "id", name: "id", label: "ID", show: false },
        { id: "title", name: "title", label: "Title" },
        { id: "description", name: "description", label: "Description" },
        { id: "language", name: "language", label: "Language" },
      ],
    },
  },
];
