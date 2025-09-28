import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useSupabase } from "../supabaseAuth";
import type { CategoriesProps } from "~/types/table.types";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

function Preferences() {
  const [hasPreference, setHasPreference] = useState(true);
  const supabase = useSupabase();
  const isFetching = useRef(false);

  useEffect(() => {
    if (isFetching.current) return;

    isFetching.current = true;

    supabase
      .from("preferences")
      .select("id, did_setup")
      .eq("did_setup", false)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching preferences:", error);
          return;
        }

        setHasPreference(!!data.did_setup);
        isFetching.current = false;
      });

    console.log("Fetching recommendations...");

    supabase
      .rpc("get_recommendations", { lang: "pt", p_limit: 20 })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching recommendations:", error);
          return;
        }

        console.log("Recommendations:", data);
      });
  }, [supabase]);

  if (hasPreference) return null;

  return (
    <Dialog open>
      <DialogContent showCloseButton={false} className="sm:max-w-4xl">
        <PreferencesCategories onSave={() => setHasPreference(true)} />
      </DialogContent>
    </Dialog>
  );
}

export default Preferences;

const PreferencesCategories = ({ onSave }: { onSave?: () => void }) => {
  const [categories, setCategories] = useState<
    Pick<CategoriesProps, "id" | "name" | "color">[]
  >([]);
  const { t } = useTranslation("general");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const supabase = useSupabase();
  const isFetching = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isFetching.current) return;

    isFetching.current = true;

    supabase
      .from("categories")
      .select("id, name, color")
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching categories:", error);
          return;
        }
        isFetching.current = false;

        setCategories(data || []);
      });
  }, [supabase]);

  const handleSave = useCallback(() => {
    const toastId = toast.loading(t("loading.saving"));
    setIsSaving(true);

    supabase
      .from("favorite_categories")
      .insert(
        selectedCategories.map((categoryId) => ({
          category_id: categoryId,
        }))
      )
      .then(({ error }) => {
        toast.dismiss(toastId);
        setIsSaving(false);

        if (error) {
          toast.error(t("error.saving"));
          console.error("Error saving favorite categories:", error);
          return;
        }

        toast.success(t("success.saving"));
        onSave?.();
      });
  }, [onSave, selectedCategories, supabase, t]);

  return (
    <div>
      <DialogHeader>
        <DialogTitle>{t("preferences.categories.title")}</DialogTitle>
        <DialogDescription>
          {t("preferences.categories.description")}
        </DialogDescription>
      </DialogHeader>

      <div className="my-5 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Button
            key={category.id}
            className="flex gap-2 items-center justify-between"
            onClick={() => {
              setSelectedCategories((prev) =>
                prev.includes(category.id)
                  ? prev.filter((id) => id !== category.id)
                  : [...prev, category.id]
              );
            }}
            style={{ backgroundColor: category.color }}
          >
            <p>{category.name}</p>
            {selectedCategories.includes(category.id) && (
              <div>
                <Check />
              </div>
            )}
          </Button>
        ))}
      </div>

      <DialogFooter>
        <DialogClose asChild onClick={handleSave}>
          <Button disabled={isSaving} variant="outline">
            {t("preferences.buttonText")}
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
};
