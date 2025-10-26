import { Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Form, type FormApi } from "react-form-krafter";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
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
import { cn } from "~/lib/utils";
import { LanguageEnum, LanguageLevelEnum } from "~/types/enums.types";
import type { CategoriesProps } from "~/types/table.types";
import KrafterRegister from "../krafter/register";
import { useSupabase, useSupabaseAuth, useUser } from "../supabaseAuth";

function Preferences() {
  const [hasPreference, setHasPreference] = useState(true);
  const [language, setLanguage] = useState<LanguageEnum>(LanguageEnum.EN);
  const [difficultyLevel, setDifficultyLevel] = useState<LanguageLevelEnum>(
    LanguageLevelEnum.BEGINNER
  );
  const [goNext, setGoNext] = useState(false);
  const supabase = useSupabase();
  const isFetching = useRef(false);
  const userId = useUser()?.id;
  const { silentRefresh } = useSupabaseAuth();

  useEffect(() => {
    if (isFetching.current) return;

    isFetching.current = true;

    supabase
      .from("preferences")
      .select("id, did_setup")
      .eq("did_setup", false)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching preferences:", error);
          return;
        }

        const info = data[0];
        if (!info) return;

        setHasPreference(!!info?.did_setup);
        isFetching.current = false;
      });
  }, [supabase]);

  const handleClose = useCallback(() => {
    supabase
      .from("preferences")
      .update({ language_learning: language, language_level: difficultyLevel })
      .eq("user_id", userId!)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating preferences:", error);
        }

        silentRefresh();
        setHasPreference(true);
      });
  }, [difficultyLevel, language, silentRefresh, supabase, userId]);

  if (hasPreference) return null;

  return (
    <Dialog open>
      <DialogContent showCloseButton={false} className="sm:max-w-4xl">
        {goNext ? (
          <PreferencesCategories language={language} onSave={handleClose} />
        ) : (
          <ChooseLanguageToLearn
            onLanguageSelect={setLanguage}
            onNext={() => setGoNext(true)}
            onDifficultyLevelChange={setDifficultyLevel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default Preferences;

export const LANGUAGE_FIELD = [
  {
    name: "language_learning",
    label: "language_learning.label",
    type: "select",
    placeholder: "language_learning.placeholder",
    initialValue: "en",
    options: [
      { label: "Spanish", value: "es" },
      { label: "English", value: "en" },
    ],
  },
  // {
  //   name: "difficulty_level",
  //   label: "difficulty_level.label",
  //   placeholder: "difficulty_level.placeholder",
  //   required: true,
  //   type: "select",
  //   options: [
  //     { label: "difficulty_level.beginner", value: "beginner" },
  //     { label: "difficulty_level.intermediate", value: "intermediate" },
  //     { label: "difficulty_level.advanced", value: "advanced" },
  //   ],
  //   initialValue: "beginner",
  // },
];

export const schemaBook = z.object({
  language_learning: z.enum(["en", "pt", "es"]),
  difficulty_level: z.enum(["beginner", "intermediate", "advanced"]),
});

export type SchemaBook = typeof schemaBook;
export type ValidatorBook = z.infer<SchemaBook>;

const ChooseLanguageToLearn = ({
  onLanguageSelect,
  onDifficultyLevelChange,
  onNext: onNextFn,
}: {
  onLanguageSelect: (language: LanguageEnum) => void;
  onDifficultyLevelChange: (level: LanguageLevelEnum) => void;
  onNext: () => void;
}) => {
  const { t } = useTranslation("general");
  const formApi = useRef<FormApi<ValidatorBook> | null>(null);

  const onNext = useCallback(() => {
    const values = formApi.current?.fieldsState;
    const language = values?.language_learning;
    const difficultyLevel = values?.difficulty_level;

    if (!language) {
      toast.error(t("preferences.language.description"));
      return;
    }

    if (!difficultyLevel) {
      toast.error(t("preferences.difficulty_level.description"));
      return;
    }

    onNextFn();

    onDifficultyLevelChange(difficultyLevel as LanguageLevelEnum);
    onLanguageSelect(language as LanguageEnum);
    // Proceed to the next step or save the preference
  }, [onDifficultyLevelChange, onLanguageSelect, onNextFn, t]);

  return (
    <div>
      <DialogHeader>
        <DialogTitle>{t("preferences.title")}</DialogTitle>
        <DialogDescription>
          {t("preferences.language.description")}
        </DialogDescription>
      </DialogHeader>

      {/* Language selection UI goes here */}
      <KrafterRegister>
        <Form<ValidatorBook, SchemaBook>
          formClassName={cn("my-5 grid grid-cols-1 gap-4 sm:grid-cols-2")}
          fields={LANGUAGE_FIELD}
          schema={schemaBook}
          formApi={formApi}
        />
      </KrafterRegister>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" onClick={onNext}>
            {t("next")}
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
};

const PreferencesCategories = ({
  onSave,
  language,
}: {
  onSave?: () => void;
  language: LanguageEnum;
}) => {
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
      .eq("language", language)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching categories:", error);
          return;
        }
        isFetching.current = false;

        setCategories(data || []);
      });
  }, [language, supabase]);

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
