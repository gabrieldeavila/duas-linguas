import i18next from "i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { Form, type FormApi } from "react-form-krafter";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
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
import { Skeleton } from "~/components/ui/skeleton";

export function meta() {
  return [
    { title: i18next.t("pages:books.title") },
    { name: "description", content: i18next.t("pages:books.description") },
  ];
}

function EditBook() {
  const formApi = useRef<FormApi<ValidatorBook> | null>(null);
  const { t } = useTranslation("pages");
  const supabase = useSupabase();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    supabase
      .from("books")
      .select(BOOK_FIELD.map((field) => field.name).join(","))
      .eq("id", id!)
      .single()
      .then(({ data, error }) => {
        setIsLoading(false);
        isLoadingRef.current = false;

        if (error) {
          toast.error(t("error.fetching"));
          console.error("Error fetching category:", error);
        } else if (data && formApi.current) {
          console.log(data);
          formApi.current.setFieldsState({
            ...(data as unknown as ValidatorBook),
            published_date: new Date(),
          });
        }
      });
  }, [id, supabase, t]);

  const handleUpdate = useCallback(
    async (data: ValidatorBook) => {
      toast.loading(t("loading.updating"));

      supabase
        .from("books")
        .update({
          ...data,
          published_date: new Date(data.published_date)
            .toISOString()
            .slice(0, 10),
        })
        .eq("id", id!)
        .then(({ error }) => {
          toast.dismiss();

          if (error) {
            toast.error(t("error.updating"));
            console.error("Error inserting books:", error);
          } else {
            navigate("/admin/books");
            toast.success(t("success.updating"));
          }
        });
    },
    [id, navigate, supabase, t]
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
            <BreadcrumbPage>{t("books.editTitle")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className={cn("mb-4 text-2xl font-bold")}>{t("books.editTitle")}</h1>

      <KrafterRegister>
        <Form<ValidatorBook, SchemaBook>
          formClassName={cn(
            "grid gap-4",
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}
          fields={BOOK_FIELD}
          schema={schemaBook}
          formApi={formApi}
          fieldWrapper={(children) =>
            isLoading ? <Skeleton className="h-10 w-full" /> : children
          }
          onSubmit={async (data) => {
            if (!data.success) return;

            await handleUpdate(data.state);
          }}
        >
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <Button type="submit">{t("books.updateButton")}</Button>
          </div>
        </Form>
      </KrafterRegister>
    </div>
  );
}

export default EditBook;
