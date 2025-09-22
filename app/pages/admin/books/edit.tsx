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
import { type BookChapterProps } from "../booksCategories/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import type { ExcerptTable, QuestionTable } from "~/types";

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
  const [chapters, setChapters] = useState<BookChapterProps[]>([]);

  useEffect(() => {
    if (!id || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    supabase
      .from("books")
      .select(
        BOOK_FIELD.map((field) => field.name).join(",") +
          ", chapters(id, title, number, error_message, status)"
      )
      .eq("id", id!)
      .single()
      .then(({ data, error }) => {
        setIsLoading(false);
        isLoadingRef.current = false;

        if (error) {
          toast.error(t("error.fetching"));
        } else if (data && formApi.current) {
          setChapters(
            (data as unknown as { chapters: BookChapterProps[] }).chapters || []
          );

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

      <ChapterList chapters={chapters} />
    </div>
  );
}

export default EditBook;

const ChapterList = ({ chapters }: { chapters: BookChapterProps[] }) => {
  const { t } = useTranslation("pages");

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-bold">{t("books.chapters")}</h2>
      <Accordion type="multiple" className="w-full">
        {chapters
          .sort((a, b) => (a.number ?? 0) - (b.number ?? 0))
          .map((chapter) => (
            <AccordionItem key={chapter.id} value={`item-${chapter.id}`}>
              <AccordionTrigger>
                {chapter.number} - {chapter.title}
                {chapter.status !== "done" && `(${chapter.status})`}
              </AccordionTrigger>
              <AccordionContent>
                {chapter.error_message ? (
                  <p className="mb-2 text-sm text-red-600">
                    {chapter.error_message}
                  </p>
                ) : (
                  <Excerpts chapterId={chapter.id} />
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>
    </div>
  );
};

const Excerpts = ({ chapterId }: { chapterId: string }) => {
  const supabase = useSupabase();
  const [excerpts, setExcerpts] = useState<ExcerptTable[]>([]);
  const [questions, setQuestions] = useState<QuestionTable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    setIsLoading(true);
    supabase
      .from("excerpts")
      .select("*")
      .eq("chapter_id", chapterId)
      .order("order_index", { ascending: true })
      .then(({ data, error }) => {
        isLoadingRef.current = false;
        setIsLoading(false);

        if (error) {
          console.error("Error fetching excerpts:", error);
        } else {
          setExcerpts(data || []);
        }
      });

    supabase
      .from("questions")
      .select("*")
      .eq("chapter_id", chapterId)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching questions:", error);
        } else {
          setQuestions(data || []);
        }
      });
  }, [chapterId, supabase]);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="flex items-center flex-col w-full">
      {excerpts.map((excerpt, index) => (
        <div
          className={cn("max-w-2xl w-full", "bg-background")}
          key={excerpt.id}
        >
          <p
            key={index}
            className={cn("mb-2 whitespace-pre-wrap text-lg leading-6")}
            style={{
              wordSpacing: "0.25em",
            }}
          >
            {excerpt.content}
          </p>
        </div>
      ))}

      {questions.length > 0 && (
        <div className="mt-4 w-full max-w-2xl">
          <h3 className="mb-2 text-lg font-bold">Questions</h3>
          <ul className="list-decimal">
            {questions.map((question) => (
              <li key={question.id} className="mb-4">
                <p className="font-medium">{question.question}</p>
                <ul className="list-none mt-1">
                  {(question.options as Array<string>)?.map((option, idx) => (
                    <li key={idx} className={cn("px-2 py-1 rounded")}>
                      {option}
                    </li>
                  ))}
                </ul>
                {question.answer && (
                  <p className="mt-1 text-sm italic">
                    Answer: {question.answer}
                  </p>
                )}
                {question.why && (
                  <p className="mt-1 text-sm italic">
                    Explanation: {question.why}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
