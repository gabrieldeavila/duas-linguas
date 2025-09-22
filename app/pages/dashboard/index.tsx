import { useCallback, useEffect, useRef, useState } from "react";
import { useSupabase } from "~/components/internal/supabaseAuth";
import { Skeleton } from "~/components/ui/skeleton";

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

  const fetchPage = useCallback(
    (pageNumber: number) => {
      if (isFetching.current) return;
      isFetching.current = true;

      setIsLoading(true);
      // setPage(pageNumber);

      supabase
        .from("books")
        .select("id, title, author, cover_image")
        .order("created_at", { ascending: false })
        .range(
          (pageNumber - 1) * LIMIT_PER_PAGE,
          pageNumber * LIMIT_PER_PAGE - 1
        )
        .then(({ data: books, error }) => {
          if (error || !books) {
            console.error("Error fetching books:", error);
          } else {
            // setData(books as unknown as TableRowProps<T>[]);
          }

          setIsLoading(false);
          isFetching.current = false;
        });
    },
    [supabase]
  );

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  if (isLoading) {
    return <Skeleton className="h-48 w-48" />;
  }

  return "Welcome";
}

export default Dashboard;
