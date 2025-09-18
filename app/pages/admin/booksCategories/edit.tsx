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
  BOOK_CATEGORIES_FIELD,
  schemaBookCategories,
  type SchemaBookCategories,
  type ValidatorBookCategories,
} from "./utils";
import { Skeleton } from "~/components/ui/skeleton";

export function meta() {
  return [
    { title: i18next.t("pages:books.title") },
    { name: "description", content: i18next.t("pages:books.description") },
  ];
}

function EditBookCategories() {
  const formApi = useRef<FormApi<ValidatorBookCategories> | null>(null);
  const { t } = useTranslation("pages");
  const { id } = useParams<{ id: string }>();
  const supabase = useSupabase();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (!id || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    supabase
      .from("vw_book_categories")
      .select("*")
      .eq("id", id!)
      .single()
      .then(({ data, error }) => {
        setIsLoading(false);
        isLoadingRef.current = false;

        if (error) {
          toast.error(t("error.fetching"));
          console.error("Error fetching category:", error);
        } else if (data && formApi.current) {
          formApi.current.setFieldsState({
            book: {
              label: data.book_title,
              id: data.book_id,
            },
            category: {
              label: data.category_name,
              id: data.category_id,
            },
          } as ValidatorBookCategories);
        }
      });
  }, [id, supabase, t]);

  const handleUpdate = useCallback(
    async (data: ValidatorBookCategories) => {
      toast.loading(t("loading.updating"));

      supabase
        .from("book_categories")
        .update({
          book_id: data.book.id,
          category_id: data.category.id,
        })
        .eq("id", id!)
        .then(({ error }) => {
          toast.dismiss();

          if (error) {
            toast.error(t("error.updating"));
          } else {
            navigate("/admin/book-categories");
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
            <BreadcrumbLinkRouter to="/admin/book-categories">
              {t("book_categories.title")}
            </BreadcrumbLinkRouter>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{t("book_categories.editTitle")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className={cn("mb-4 text-2xl font-bold")}>
        {t("book_categories.editTitle")} aa
      </h1>

      <KrafterRegister>
        <Form<ValidatorBookCategories, SchemaBookCategories>
          formClassName={cn(
            "grid gap-4",
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}
          fields={BOOK_CATEGORIES_FIELD}
          schema={schemaBookCategories}
          fieldWrapper={(children) =>
            isLoading ? <Skeleton className="h-10 w-full" /> : children
          }
          formApi={formApi}
          onSubmit={async (data) => {
            if (!data.success) return;

            handleUpdate(data.state);
          }}
        >
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <Button type="submit">{t("categories.updateButton")}</Button>
          </div>
        </Form>
      </KrafterRegister>
    </div>
  );
}

export default EditBookCategories;
