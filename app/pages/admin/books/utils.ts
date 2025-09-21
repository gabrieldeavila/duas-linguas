import type { Field } from "react-form-krafter";
import z from "zod";

export const schemaBook = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  description: z.string().min(1),
  published_date: z.date(),
  cover_image_url: z.string(),
  language: z.enum(["en", "pt", "es"]),
  difficulty_level: z.enum(["beginner", "intermediate", "advanced"]),
  chapter_start: z.number().min(1),
  chapter_end: z.number().min(1),
});

export type SchemaBook = typeof schemaBook;
export type ValidatorBook = z.infer<SchemaBook>;

export const BOOK_FIELD: Field[] = [
  {
    name: "title",
    label: "title.label",
    placeholder: "title.placeholder",
    required: true,
    disabled: false,
    type: "text",
    initialValue: "",
    wrapperClassName: "gap-3 col-span-1 md:col-span-2",
  },
  {
    name: "author",
    label: "author.label",
    placeholder: "author.placeholder",
    required: true,
    disabled: false,
    type: "text",
    initialValue: "",
    wrapperClassName: "gap-3",
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
    name: "published_date",
    label: "published_date.label",
    placeholder: "published_date.placeholder",
    required: true,
    disabled: false,
    type: "date",
    initialValue: "",
    wrapperClassName: "gap-3",
  },
  {
    name: "cover_image_url",
    label: "cover_image_url.label",
    placeholder: "cover_image_url.placeholder",
    required: false,
    type: "text",
    initialValue: "",
    wrapperClassName: "gap-3",
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
  {
    name: "difficulty_level",
    label: "difficulty_level.label",
    placeholder: "difficulty_level.placeholder",
    required: true,
    type: "select",
    options: [
      { label: "difficulty_level.beginner", value: "beginner" },
      { label: "difficulty_level.intermediate", value: "intermediate" },
      { label: "difficulty_level.advanced", value: "advanced" },
    ],
    initialValue: "beginner",
    wrapperClassName: "gap-3",
  },
  {
    name: "chapter_start",
    label: "chapter_start.label",
    placeholder: "chapter_start.placeholder",
    required: true,
    type: "number",
    wrapperClassName: "gap-3",
  },
  {
    name: "chapter_end",
    label: "chapter_end.label",
    placeholder: "chapter_end.placeholder",
    required: true,
    type: "number",
    wrapperClassName: "gap-3",
  },
];
