import i18next from "i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useParams, type LoaderFunctionArgs } from "react-router";
import { toast } from "sonner";
import { PaginationBuilder } from "~/components/internal/pagination/builder";
import { useSupabase } from "~/components/internal/supabaseAuth";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLinkRouter,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Skeleton } from "~/components/ui/skeleton";
import { supabase } from "~/lib/supabase";
import type { ExcerptTable } from "~/types";
import Quiz from "./quiz";

export async function loader({ params }: LoaderFunctionArgs) {
  let title = "";

  await supabase
    .from("books")
    .select("title")
    .eq("id", params.id!)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching book focus:", error);
        return;
      }
      title = data?.title || "";
    });

  return { title };
}

export function meta({ data }: { data: { title: string } }) {
  return [
    { title: data.title },
    {
      name: "description",
      content: i18next.t("pages:read.reading", { bookTitle: data.title }),
    },
  ];
}

function Read() {
  const { id } = useParams<{ id: string }>();
  const isLoadingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState<string>("");
  const [bookTitle, setBookTitle] = useState<string>("");
  const [currentChapterNumber, setCurrentChapterNumber] = useState<number>(0);
  const [chapterId, setChapterId] = useState<string>("");
  const [referralLink, setRefferalLink] = useState<string>("");
  const [chaptersGaps, setChaptersGaps] = useState<{
    min: number;
    max: number;
  }>({ min: 0, max: 0 });
  const { t } = useTranslation("pages");

  const supabase = useSupabase();

  useEffect(() => {
    if (!id || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    supabase
      .from("book_focus")
      .select(
        "chapter_id, excerpt_id, chapters(id, title, number), books(id, title, start_chapter, end_chapter, referral_link)"
      )
      .eq("book_id", id)
      .limit(1)
      .then(({ data, error }) => {
        setIsLoading(false);
        isLoadingRef.current = false;

        if (error) {
          console.error("Error fetching book focus:", error);
          return;
        }

        if (!data) {
          console.warn("No book focus found");
          return;
        }

        const info = data[0];

        setCurrentChapterNumber(info.chapters?.number || 0);
        setChaptersGaps({
          min: info.books.start_chapter || 0,
          max: info.books.end_chapter || 0,
        });
        setRefferalLink(info.books?.referral_link || "");
        setTitle(info.chapters?.title || "");
        setBookTitle(info.books?.title || "");
      });
  }, [id, supabase]);

  const handleChapterChange = useCallback(
    (page: number) => {
      const idToast = toast.loading(
        t("read.loadingChapter", { chapterNumber: page })
      );

      supabase
        .rpc("set_book_focus", {
          p_book_id: id!,
          p_chapter_number: page,
        })
        .then(() => {
          // get the updated chapter title
          supabase
            .from("chapters")
            .select("title")
            .eq("book_id", id!)
            .eq("number", page)
            .limit(1)
            .then(({ data, error }) => {
              if (error) {
                console.error("Error fetching chapter title:", error);
                return;
              }

              if (data && data.length > 0) {
                setTitle(data[0].title);
              }
            });

          // scroll to window top
          toast.success(t("read.changedChapterTo", { chapterNumber: page }));
          toast.dismiss(idToast);
          setCurrentChapterNumber(page);
        });
    },
    [id, supabase, t]
  );

  const goToNextChapter = useCallback(() => {
    if (currentChapterNumber < chaptersGaps.max) {
      handleChapterChange(currentChapterNumber + 1);
    }
  }, [currentChapterNumber, chaptersGaps.max, handleChapterChange]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLinkRouter to="/dashboard">
              Dashboard
            </BreadcrumbLinkRouter>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbPage>{bookTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold mb-4 text-center">{title}</h1>
      <div className="flex items-center flex-col w-full">
        {currentChapterNumber && (
          <ChapterExcerpts
            bookId={id!}
            chapterNumber={currentChapterNumber}
            setChapterId={setChapterId}
          />
        )}
      </div>

      {chapterId && (
        <Quiz
          goToNextChapter={goToNextChapter}
          bookId={id!}
          chapterId={chapterId}
        />
      )}

      {chaptersGaps.max === 0 ? null : (
        <div className="flex items-center flex-col my-4">
          <PaginationBuilder
            currentPage={currentChapterNumber}
            totalPages={chaptersGaps.max - chaptersGaps.min + 1}
            onPageChange={handleChapterChange}
          />
        </div>
      )}

      {referralLink && <WarningRead referral={referralLink} />}
    </div>
  );
}

export default Read;

const ChapterExcerpts = ({
  bookId,
  chapterNumber,
  setChapterId,
}: {
  bookId: string;
  chapterNumber: number;
  setChapterId: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const supabase = useSupabase();
  const [excerpts, setExcerpts] = useState<
    Pick<ExcerptTable, "content" | "id">[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    (async () => {
      setIsLoading(true);
      const chapterId = await supabase
        .from("chapters")
        .select("id")
        .eq("book_id", bookId)
        .eq("number", chapterNumber)
        .limit(1)
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching chapter ID:", error);
            return null;
          }
          setChapterId(data[0].id);

          return data && data.length > 0 ? data[0].id : null;
        });

      if (!chapterId) {
        isLoadingRef.current = false;
        setIsLoading(false);
        return;
      }

      supabase
        .from("excerpts")
        .select("content, id")
        .eq("book_id", bookId)
        .eq("chapter_id", chapterId)
        .order("order_index", { ascending: true })
        .then(({ data, error }) => {
          isLoadingRef.current = false;
          setIsLoading(false);

          if (error) {
            console.error("Error fetching excerpts:", error);
          } else {
            setExcerpts(data || []);
            window.scrollTo({ top: 0, behavior: "instant" });
          }
        });
    })();
  }, [bookId, chapterNumber, setChapterId, supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center flex-col gap-2 w-full max-w-5xl">
        {Array.from({ length: 25 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center flex-col w-full max-w-5xl">
      {excerpts.map((excerpt) => (
        <div key={excerpt.id} className="w-full p-4 border-b">
          <p>{excerpt.content}</p>
        </div>
      ))}
    </div>
  );
};

const WarningRead = ({ referral }: { referral: string }) => {
  const { t } = useTranslation("pages");

  return (
    <div className="mt-4 flex items-center flex-col">
      <p className="opacity-50 text-center text-xs">{t("read.warning_first")}</p>
      <p className="opacity-50 text-center text-xs mt-2">
        <Trans t={t} i18nKey="read.warning_second">
          <a
            href={referral}
            target="_blank"
            className="underline underline-offset-4"
          />
        </Trans>
      </p>
    </div>
  );
};
