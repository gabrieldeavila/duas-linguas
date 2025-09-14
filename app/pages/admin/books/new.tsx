import i18next from "i18next";
import { useRef } from "react";
import { Form, type Field, type FormApi } from "react-form-krafter";
import { useTranslation } from "react-i18next";
import z from "zod";
import KrafterRegister from "~/components/internal/krafter/register";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLinkRouter,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const schema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  description: z.string().min(1),
  published_date: z.date(),
  cover_image_url: z.string().min(1).optional(),
  language: z.string().min(1),
  difficulty_level: z.string().min(1),
  chapter_start: z.number().min(1),
  chapter_end: z.number().min(1),
});

type Schema = typeof schema;
type Validator = z.infer<Schema>;

export function meta() {
  return [
    { title: i18next.t("pages:books.title") },
    { name: "description", content: i18next.t("pages:books.description") },
  ];
}

const BOOK_FIELD: Field[] = [
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
    type: "textarea",
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

function NewBook() {
  const formApi = useRef<FormApi<Validator> | null>(null);
  const { t } = useTranslation("pages");

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLinkRouter to="/admin">Admin</BreadcrumbLinkRouter>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLinkRouter to="/admin/books">Books</BreadcrumbLinkRouter>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{t("books.title")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className={cn("mb-4 text-2xl font-bold")}>{t("books.title")}</h1>

      <KrafterRegister>
        <Form<Validator, Schema>
          formClassName={cn(
            "grid gap-4",
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}
          fields={BOOK_FIELD}
          schema={schema}
          formApi={formApi}
          onSubmit={async (data) => {
            console.log(data);
          }}
        >
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <Button type="submit">{t("books.submitButton")}</Button>
          </div>
        </Form>
      </KrafterRegister>
    </div>
  );
}

export default NewBook;
