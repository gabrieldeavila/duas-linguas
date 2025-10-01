import { useCallback, useEffect, useRef, useState } from "react";
import { useSupabase } from "~/components/internal/supabaseAuth";
import { Skeleton } from "~/components/ui/skeleton";
import { useReadChildren } from "~/hooks/useReadChildren";
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
  const { setContainer, readChildren } = useReadChildren();
  const readExcerptIds = useRef<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const didPaginateEnd = useRef(true);

  const readTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (readTimer.current) {
      clearTimeout(readTimer.current);
    }

    readTimer.current = setTimeout(async () => {
      if (readChildren.size === 0) return;

      const currentRecommendations = (await new Promise((resolve) =>
        setRecommendations((prev) => {
          resolve(prev);
          return prev;
        })
      )) as RecommendationProps[];

      const excerptIds = Array.from(readChildren).map((index) => {
        const rec = currentRecommendations[index];
        return rec?.excerpt_id;
      });

      // remove the ones that are already in readExcerptIds
      const uniqueExcerptIds = excerptIds.filter(
        (id) => !readExcerptIds.current.has(id)
      );

      readExcerptIds.current = new Set([
        ...readExcerptIds.current,
        ...uniqueExcerptIds.filter((id): id is string => !!id),
      ]);

      if (uniqueExcerptIds.length === 0) return;

      supabase
        .from("excerpt_read")
        // @ts-expect-error - user_is is set on the database side
        .upsert(
          uniqueExcerptIds.map((id) => ({ excerpt_id: id })),
          {
            onConflict: ["excerpt_id", "user_id"],
            ignoreDuplicates: true,
          }
        )
        .then(({ error }) => {
          if (error) {
            console.error("Error marking excerpts as read:", error);
            return;
          }
        });
    }, 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readChildren]);

  const fetchPage = useCallback(
    (pageNumber: number) => {
      if (isFetching.current || !didPaginateEnd.current) return;
      isFetching.current = true;

      setIsLoading(true);
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
    fetchPage(0);
  }, [fetchPage]);

  useEffect(() => {
    const checkWindowScroll = () => {
      const scrollPosition =
        window.innerHeight + document.documentElement.scrollTop;
      const threshold = document.documentElement.offsetHeight - 100;

      if (scrollPosition >= threshold) {
        fetchPage(currentPage + 1);
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
      <div
        ref={isLoading ? null : setContainer}
        className="flex items-center flex-col gap-5"
      >
        {isLoading &&
          Array.from({ length: LIMIT_PER_PAGE }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full sm:w-lg rounded-md" />
          ))}

        {recommendations.map((rec) => (
          <Recommendation key={rec.excerpt_id} excerpt={rec} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

const Recommendation = ({ excerpt }: { excerpt: RecommendationProps }) => {
  return (
    <div className="p-4 border rounded shadow w-full sm:w-lg">
      <p>{excerpt.content}</p>
    </div>
  );
};
