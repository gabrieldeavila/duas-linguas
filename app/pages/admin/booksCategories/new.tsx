import i18next from "i18next";
import { useCallback, useRef } from "react";
import { Form, type Field, type FormApi } from "react-form-krafter";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";
import KrafterRegister from "~/components/internal/krafter/register";
import { useSupabase } from "~/components/internal/supabaseAuth";
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
  book: z.object({
    label: z.string().min(1, "Book is required"),
    id: z.string().min(1, "Book is required"),
  }),
  category: z.object({
    label: z.string().min(1, "Category is required"),
    id: z.string().min(1, "Category is required"),
  }),
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
    name: "category",
    label: "Category",
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
    label: "Book",
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

function NewCategories() {
  const formApi = useRef<FormApi<Validator> | null>(null);
  const { t } = useTranslation("pages");
  const supabase = useSupabase();
  const navigate = useNavigate();

  const handleSave = useCallback(
    async (data: Validator) => {
      toast.loading("Saving category...");

      supabase
        .from("book_categories")
        .insert({
          book_id: data.book.id,
          category_id: data.category.id,
        })
        .then(({ error }) => {
          toast.dismiss();

          if (error) {
            toast.error("Error saving category.");
            console.error("Error inserting category:", error);
          } else {
            navigate("/admin/book-categories");
            toast.success("Category saved successfully!");
          }
        });
    },
    [navigate, supabase]
  );

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLinkRouter to="/admin">Admin</BreadcrumbLinkRouter>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLinkRouter to="/admin/book-categories">
              Book Categories
            </BreadcrumbLinkRouter>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{t("book_categories.title")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className={cn("mb-4 text-2xl font-bold")}>
        {t("book_categories.title")}
      </h1>

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

            if (!data.success) return;

            handleSave(data.state);
          }}
        >
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <Button type="submit">{t("categories.submitButton")}</Button>
          </div>
        </Form>
      </KrafterRegister>
    </div>
  );
}

export default NewCategories;
