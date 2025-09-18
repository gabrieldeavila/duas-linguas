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

function NewCategories() {
  const formApi = useRef<FormApi<ValidatorCategories> | null>(null);
  const { t } = useTranslation("pages");
  const supabase = useSupabase();
  const navigate = useNavigate();

  const handleSave = useCallback(
    async (data: ValidatorCategories) => {
      toast.loading(t("loading.saving"));

      supabase
        .from("categories")
        .insert(data)
        .then(({ error }) => {
          toast.dismiss();

          if (error) {
            toast.error(t("error.saving"));
            console.error("Error inserting category:", error);
          } else {
            navigate("/admin/categories");
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
            <BreadcrumbLinkRouter to="/admin/categories">
              {t("categories.title")}
            </BreadcrumbLinkRouter>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{t("categories.newTitle")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className={cn("mb-4 text-2xl font-bold")}>
        {t("categories.newTitle")}
      </h1>

      <KrafterRegister>
        <Form<ValidatorCategories, SchemaCategories>
          formClassName={cn(
            "grid gap-4",
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}
          fields={CATEGORIES_FIELD}
          schema={schemaCategories}
          formApi={formApi}
          onSubmit={async (data) => {
            if (!data.success) return;

            handleSave(data.state);
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

export default NewCategories;
