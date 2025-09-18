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
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import {
  CATEGORIES_FIELD,
  schemaCategories,
  type SchemaCategories,
  type ValidatorCategories,
} from "./utils";

export function meta() {
  return [
    { title: i18next.t("pages:books.title") },
    { name: "description", content: i18next.t("pages:books.description") },
  ];
}

function EditCategories() {
  const formApi = useRef<FormApi<ValidatorCategories> | null>(null);
  const { t } = useTranslation("pages");
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const supabase = useSupabase();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    supabase
      .from("categories")
      .select("*")
      .eq("id", id!)
      .single()
      .then(({ data, error }) => {
        setIsLoading(false);
        isLoadingRef.current = false;

        if (error) {
          toast.error(t("error.fetching"));
        } else if (data && formApi.current) {
          formApi.current.setFieldsState(data as ValidatorCategories);
        }
      });
  }, [id, supabase, t]);

  const handleUpdate = useCallback(
    async (data: ValidatorCategories) => {
      toast.loading(t("loading.updating"));

      supabase
        .from("categories")
        .update(data)
        .eq("id", id!)
        .then(({ error }) => {
          toast.dismiss();

          if (error) {
            toast.error(t("error.updating"));
            console.error("Error inserting category:", error);
          } else {
            navigate("/admin/categories");
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
            <BreadcrumbLinkRouter to="/admin/categories">
              {t("categories.title")}
            </BreadcrumbLinkRouter>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{t("categories.editTitle")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className={cn("mb-4 text-2xl font-bold")}>
        {t("categories.editTitle")}
      </h1>

      <KrafterRegister>
        <Form<ValidatorCategories, SchemaCategories>
          formClassName={cn(
            "grid gap-4",
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}
          fields={CATEGORIES_FIELD}
          schema={schemaCategories}
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

export default EditCategories;
