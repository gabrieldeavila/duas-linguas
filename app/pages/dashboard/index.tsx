import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useSupabase } from "~/components/internal/supabaseAuth";
import { Skeleton } from "~/components/ui/skeleton";
import getPastelColors from "~/lib/color";
import { cn, tmeta } from "~/lib/utils";
import type {
  RecommendationProps,
  SuggestionsProps,
} from "~/types/table.types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";
import i18next from "i18next";
import UserStats from "./utils/stats";

export function meta() {
  i18next.loadNamespaces("pages");

  return [
    { title: tmeta("pages:dashboard.title") },
    { name: "description", content: tmeta("pages:dashboard.description") },
  ];
}

const LIMIT_PER_PAGE = 20;

function Dashboard() {
  const supabase = useSupabase();
  const { t } = useTranslation("dashboard");
  const isFetching = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationProps[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(0);
  const currentPageRef = useRef(currentPage);
  const didPaginateEnd = useRef(true);

  const fetchPage = useCallback(
    (pageNumber: number) => {
      if (isFetching.current || !didPaginateEnd.current) return;
      isFetching.current = true;

      setIsLoading(true);
      currentPageRef.current = pageNumber;
      setCurrentPage(pageNumber);

      supabase
        .rpc("get_recommendations", {
          p_limit: LIMIT_PER_PAGE,
          p_offset: pageNumber * LIMIT_PER_PAGE,
        })
        .then(({ data, error }) => {
          setIsLoading(false);
          isFetching.current = false;

          if (error) {
            console.error("Error fetching recommendations:", error);
            return;
          }

          if (!data || data.length === 0) {
            didPaginateEnd.current = false;
            return;
          }

          setRecommendations((prev) => [...prev, ...(data || [])]);
        });
    },
    [supabase]
  );

  useEffect(() => {
    setRecommendations([]);
    fetchPage(0);
  }, [fetchPage]);

  useEffect(() => {
    const checkWindowScroll = () => {
      const scrollPosition =
        window.innerHeight + document.documentElement.scrollTop;
      const threshold = document.documentElement.offsetHeight - 100;

      if (scrollPosition >= threshold) {
        fetchPage(currentPageRef.current + 1);
      }
    };

    window.addEventListener("scroll", checkWindowScroll);
    return () => {
      window.removeEventListener("scroll", checkWindowScroll);
    };
  }, [currentPage, fetchPage]);

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbPage>{t("title")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <UserStats />

      <ReadingList />

      {recommendations.length > 0 && (
        <h2 className="text-xl font-bold my-4">
          {t("based_on_your_preferences")}
        </h2>
      )}

      <div className="flex items-center flex-col gap-5">
        {isLoading &&
          Array.from({ length: LIMIT_PER_PAGE }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full sm:w-lg rounded-md" />
          ))}
        {recommendations.length > 0 && (
          <div className="flex flex-wrap justify-center gap-5 w-full">
            {recommendations.map((rec) => (
              <Recommendation key={rec.id} book={rec} />
            ))}
          </div>
        )}
      </div>

      <MayAlsoLike />
    </div>
  );
}

export default Dashboard;

const Recommendation = ({
  book,
}: {
  book: Omit<RecommendationProps, "difficulty_level">;
}) => {
  const colors = useMemo(() => getPastelColors(book.id, 3), [book.id]);
  const { t } = useTranslation("dashboard");
  const supabase = useSupabase();
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    supabase.rpc("set_book_focus", { p_book_id: book.id }).then(({ error }) => {
      if (error) {
        console.error("Error setting book focus:", error);
      } else {
        navigate(`/book/read/${book.id}`);
      }
    });
  }, [book.id, navigate, supabase]);

  return (
    <button
      className="flex rounded shadow w-full sm:w-lg max-w-lg cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleClick}
    >
      <div
        className={cn(
          "min-h-64",
          "flex flex-col",
          "items-center",
          "justify-center",
          "p-4",
          "rounded-md",
          "flex-grow"
        )}
        style={{
          background: `linear-gradient(135deg, ${colors.join(", ")})`,
        }}
      >
        {/* add shadow black text */}
        <p
          className={cn("text-lg font-semibold")}
          style={{
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.7)",
          }}
        >
          {book.title}
        </p>
        <p
          className="text-sm"
          style={{
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.7)",
          }}
        >
          {t("by", { author: book.author })}
        </p>
      </div>
    </button>
  );
};

const ReadingList = () => {
  const { t } = useTranslation("dashboard");
  const supabase = useSupabase();
  const [readingList, setReadingList] = useState<
    Omit<RecommendationProps, "difficulty_level">[]
  >([]);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    supabase
      .from("book_focus")
      .select("book:books(id, title, cover_image_url, description, author)")
      .eq("did_finish_all_quizzes", false)
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        isLoadingRef.current = false;

        if (error) {
          console.error("Error fetching reading list:", error);
          return;
        }
        if (!data) return;

        setReadingList(
          data
            .map((item) => item.book)
            .filter(
              (book): book is Omit<RecommendationProps, "difficulty_level"> =>
                book !== null
            )
        );
      });
  }, [supabase]);

  if (!readingList || readingList.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t("reading_list")}</h2>
      <div className="flex flex-wrap justify-center gap-5 w-full mb-8">
        {readingList.map((book) => (
          <Recommendation key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
};

const MayAlsoLike = () => {
  const { t } = useTranslation("dashboard");
  const supabase = useSupabase();
  const isLoadingRef = useRef(false);
  const [suggestions, setSuggestions] = useState<SuggestionsProps[]>([]);

  useEffect(() => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    supabase.rpc("match_book_suggestions").then(({ data, error }) => {
      isLoadingRef.current = false;

      if (error) {
        console.error("Error fetching 'May Also Like' books:", error);
        return;
      }

      setSuggestions(data || []);
    });
  }, [supabase]);

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mt-8 mb-4">{t("may_also_like")}</h2>
      {/* Placeholder for "May Also Like" books */}
      <div className="flex flex-wrap justify-center gap-5 w-full">
        {suggestions.map((suggestion) => (
          <Recommendation key={suggestion.id} book={suggestion} />
        ))}
      </div>
    </div>
  );
};
