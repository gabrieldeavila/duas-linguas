import i18next from "i18next";
import { Trash } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Form,
  useFieldsState,
  useForm,
  type FormApi,
} from "react-form-krafter";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import KrafterRegister from "~/components/internal/krafter/register";
import {
  LANGUAGE_FIELD,
  PreferencesCategories,
  schemaBook,
  type SchemaBook,
  type ValidatorBook,
} from "~/components/internal/preferences";
import { useSupabase, useUser } from "~/components/internal/supabaseAuth";
import AlertDelete from "~/components/internal/variations/alert";
import { ButtonLoading } from "~/components/internal/variations/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { cn, tmeta } from "~/lib/utils";
import type { LanguageEnum } from "~/types/enums.types";
import type { CategoriesProps } from "~/types/table.types";

export function meta() {
  i18next.loadNamespaces("pages");

  return [
    { title: tmeta("pages:preferences.title") },
    {
      name: "description",
      content: tmeta("pages:preferences.description"),
    },
  ];
}

function Preferences() {
  const formApi = useRef<FormApi<ValidatorBook> | null>(null);
  const { t } = useTranslation("general");
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const supabase = useSupabase();
  const [initialState, setInitialState] = useState<ValidatorBook | null>(null);

  useEffect(() => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    supabase
      .from("preferences")
      .select("language_learning")
      .limit(1)
      .single()
      .then(({ data, error }) => {
        isLoadingRef.current = false;

        if (error) {
          console.error("Error fetching preferences:", error);
          return;
        }

        if (!data || formApi.current === null) {
          console.warn("No preferences found");
          return;
        }

        formApi.current.setFieldsState(data as unknown as ValidatorBook);
        setInitialState(data as unknown as ValidatorBook);

        setIsLoading(false);
      });
  }, [supabase]);

  const languageEnum = useMemo(() => {
    return initialState?.language_learning as LanguageEnum;
  }, [initialState?.language_learning]);

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{t("preferences.title")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <KrafterRegister>
        <Form<ValidatorBook, SchemaBook>
          formClassName={cn("my-5 grid grid-cols-1 gap-4 sm:grid-cols-2")}
          fieldWrapper={(children) =>
            isLoading ? <Skeleton className="h-10 w-full" /> : children
          }
          fields={LANGUAGE_FIELD}
          schema={schemaBook}
          formApi={formApi}
        >
          <div className="col-span-3 flex">
            <UpdateForm
              initialState={initialState}
              setInitialState={setInitialState}
            />
          </div>
        </Form>
      </KrafterRegister>

      {languageEnum && <FavoriteCategories language={languageEnum} />}
    </div>
  );
}

export default Preferences;

const UpdateForm = ({
  initialState,
  setInitialState,
}: {
  initialState: ValidatorBook | null;
  setInitialState: React.Dispatch<React.SetStateAction<ValidatorBook | null>>;
}) => {
  const fieldsState = useFieldsState<ValidatorBook>();
  const formApi = useForm();
  const supabase = useSupabase();
  const userId = useUser()?.id;
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation("general");

  const isDiff = useMemo(() => {
    if (!initialState) return false;

    return JSON.stringify(fieldsState) !== JSON.stringify(initialState);
  }, [fieldsState, initialState]);

  const handleSubmit = useCallback(() => {
    setIsSaving(true);
    supabase
      .from("preferences")
      .update({ language_learning: fieldsState.language_learning })
      .eq("user_id", userId!)
      .then(({ error }) => {
        setIsSaving(false);
        setInitialState(fieldsState);
        formApi.setFieldsState(fieldsState);

        if (error) {
          toast.error(t("error.updating"));
          console.error("Error updating preferences:", error);
        } else {
          toast.success(t("success.updating"));
        }
      });
  }, [fieldsState, formApi, setInitialState, supabase, t, userId]);

  if (!isDiff) return null;

  return (
    <div className="flex gap-2">
      <ButtonLoading isLoading={isSaving} onClick={handleSubmit}>
        {t("saveChanges")}
      </ButtonLoading>

      <Button className="py-0 px-2.5" onClick={() => formApi.reset()}>
        {t("cancel")}
      </Button>
    </div>
  );
};

const FavoriteCategories = ({ language }: { language: LanguageEnum }) => {
  const supabase = useSupabase();
  const [favoriteCategories, setFavoriteCategories] = useState<
    Pick<CategoriesProps, "id" | "name" | "color">[]
  >([]);
  const { t } = useTranslation("general");
  const [refresh, setRefresh] = useState(0);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;

    supabase
      .from("favorite_categories")
      .select("id, category:categories(id, name, color)")
      .then(({ data, error }) => {
        isLoadingRef.current = false;

        if (error) {
          console.error("Error fetching favorite categories:", error);
          return;
        }

        const categories = data
          .map((item) => ({
            id: item.id,
            name: item.category.name,
            color: item.category.color,
          }))
          .filter((item) => item?.id !== undefined);

        setFavoriteCategories(categories);
      });
  }, [supabase, refresh]);

  const handleDelete = useCallback(
    (categoryId: string) => {
      const toastId = toast.loading(t("loading.deleting"));

      supabase
        .from("favorite_categories")
        .delete()
        .eq("id", categoryId)
        .then(({ error }) => {
          toast.dismiss(toastId);
          if (error) {
            toast.error(t("error.deleting"));
            console.error("Error deleting favorite category:", error);
            return;
          }

          setFavoriteCategories((prev) =>
            prev.filter((category) => category.id !== categoryId)
          );

          toast.success(t("success.deleting"));
        });
    },
    [supabase, t]
  );

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <h2>{t("favorite_categories.title")}</h2>

      <div className="flex flex-wrap gap-2 mt-2">
        {favoriteCategories.map((category) => (
          <div
            key={category.id}
            style={{ backgroundColor: category.color }}
            className={cn(
              "p-2 my-2 rounded-md text-white w-fit",
              "flex gap-4 items-center"
            )}
          >
            <p>{category.name}</p>

            <AlertDelete onDelete={() => handleDelete(category.id)}>
              <Trash size={16} />
            </AlertDelete>
          </div>
        ))}
      </div>

      {/* modal to add favorite category */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">{t("favorite_categories.add")}</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-4xl">
          <PreferencesCategories
            language={language}
            onSave={() => {
              setRefresh((prev) => prev + 1);
              setIsOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
