import type { Field } from "react-form-krafter";
import z from "zod";

export const schemaCategories = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  language: z.enum(["en", "pt", "es"]),
});

export type SchemaCategories = typeof schemaCategories;
export type ValidatorCategories = z.infer<SchemaCategories>;

export const CATEGORIES_FIELD: Field[] = [
  {
    name: "name",
    label: "name.label",
    placeholder: "name.placeholder",
    required: true,
    disabled: false,
    type: "text",
    initialValue: "",
    wrapperClassName: "gap-3 col-span-1 md:col-span-2",
  },
  {
    name: "description",
    label: "description.label",
    placeholder: "description.placeholder",
    required: true,
    disabled: false,
    type: "text",
    initialValue: "",
    wrapperClassName: "gap-3",
  },
  {
    name: "color",
    label: "color.label",
    placeholder: "color.placeholder",
    required: false,
    type: "color",
  },
  {
    name: "language",
    label: "language.label",
    placeholder: "language.placeholder",
    required: true,
    type: "select",
    initialValue: "",
    options: [
      { label: "English", value: "en" },
      { label: "Português", value: "pt" },
      { label: "Español", value: "es" },
    ],
    wrapperClassName: "gap-3",
  },
];
