import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
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
import type { ExcerptTable } from "~/types";

type BookDataProps = {
  chapter_id: string | null;
  excerpt_id: string | null;
};

function Read() {
  const { id } = useParams<{ id: string }>();
  const isLoadingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<BookDataProps | null>(null);
  const [title, setTitle] = useState<string>("");
  const [bookTitle, setBookTitle] = useState<string>("");

  const supabase = useSupabase();

  useEffect(() => {
    if (!id || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    supabase
      .from("book_focus")
      .select("chapter_id, excerpt_id, chapters(id, title), books(title)")
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

        setTitle(data[0].chapters?.title || "");
        setBookTitle(data[0].books?.title || "");
        setData(data[0]);
      });
  }, [id, supabase]);

  useEffect(() => {}, []);

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
        {data?.chapter_id && (
          <ChapterExcerpts bookId={id!} chapterId={data.chapter_id} />
        )}
      </div>
    </div>
  );
}

export default Read;

const ChapterExcerpts = ({
  bookId,
  chapterId,
}: {
  bookId: string;
  chapterId: string;
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

    setIsLoading(true);
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
        }
      });
  }, [bookId, chapterId, supabase]);

  if (isLoading) {
    return Array.from({ length: 10 }, (_, i) => (
      <Skeleton key={i} className="h-10 w-full" />
    ));
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
