import i18next from "i18next";
import { useCallback, useRef } from "react";
import { Form, type FormApi } from "react-form-krafter";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
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
import {
  BOOK_FIELD,
  schemaBook,
  type SchemaBook,
  type ValidatorBook,
} from "./utils";

export function meta() {
  return [
    { title: i18next.t("pages:books.title") },
    { name: "description", content: i18next.t("pages:books.description") },
  ];
}

function NewBook() {
  const formApi = useRef<FormApi<ValidatorBook> | null>(null);
  const { t } = useTranslation("pages");
  const supabase = useSupabase();
  const navigate = useNavigate();

  const handleSave = useCallback(
    async (data: ValidatorBook) => {
      toast.loading(t("loading.saving"));

      supabase
        .from("books")
        .insert(data)
        .then(({ error }) => {
          toast.dismiss();

          if (error) {
            toast.error(t("error.saving"));
            console.error("Error inserting books:", error);
          } else {
            navigate("/admin/books");
            toast.success(t("success.saving"));
          }
        });
    },
    [navigate, supabase, t]
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
            <BreadcrumbLinkRouter to="/admin/books">
              {t("books.title")}
            </BreadcrumbLinkRouter>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{t("books.newTitle")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className={cn("mb-4 text-2xl font-bold")}>{t("books.newTitle")}</h1>

      <KrafterRegister>
        <Form<ValidatorBook, SchemaBook>
          formClassName={cn(
            "grid gap-4",
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}
          fields={BOOK_FIELD}
          schema={schemaBook}
          formApi={formApi}
          onSubmit={async (data) => {
            if (!data.success) return;

            await handleSave(data.state);
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
