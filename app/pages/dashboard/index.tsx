import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useSupabase } from "~/components/internal/supabaseAuth";
import { Skeleton } from "~/components/ui/skeleton";
import getPastelColors from "~/lib/color";
import { cn } from "~/lib/utils";
import type { RecommendationProps } from "~/types/table.types";

export function meta() {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Welcome to the Dashboard!" },
  ];
}

const LIMIT_PER_PAGE = 20;

function Dashboard() {
  const supabase = useSupabase();
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
            console.log("No more recommendations to load.");
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
      <h1 className="text-2xl font-bold mb-4">Your Feed</h1>
      <div className="flex items-center flex-col gap-5">
        {isLoading &&
          Array.from({ length: LIMIT_PER_PAGE }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full sm:w-lg rounded-md" />
          ))}

        <div className="flex flex-wrap justify-center gap-5 w-full">
          {recommendations.map((rec) => (
            <Recommendation key={rec.id} book={rec} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

const Recommendation = ({ book }: { book: RecommendationProps }) => {
  const colors = useMemo(() => getPastelColors(book.id, 3), [book.id]);
  const { t } = useTranslation("dashboard");
  const supabase = useSupabase();
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    supabase
      .rpc("set_book_focus", { p_book_id: book.id })
      .then(({ error, data }) => {
        if (error) {
          console.error("Error setting book focus:", error);
        } else {
          console.log(data);
          // window.location.href = `/books/${book.id}`;
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
