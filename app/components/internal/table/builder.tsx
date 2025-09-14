import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSupabase } from "../supabaseAuth";
import type { TableBuilderProps } from "~/types/table.types";
import { PaginationBuilder } from "../pagination/builder";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

const LIMIT_PER_PAGE = 5;

function TableBuilder({ columns, tableName }: TableBuilderProps) {
  const supabase = useSupabase();
  const isFetching = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [tableSize, setTableSize] = useState(0);

  const [data, setData] = useState<
    Record<string, string | number | boolean | null>[]
  >([]);

  const selectedColumns = useMemo(
    () => columns.map((col) => col.name).join(", "),
    [columns]
  );

  const isFindingLimit = useRef(false);

  const findLimit = useCallback(() => {
    if (isFindingLimit.current) return;

    isFindingLimit.current = true;

    supabase
      .from(tableName)
      .select("*", { count: "exact" })
      .then(({ count, error }) => {
        isFindingLimit.current = false;

        if (error) {
          console.error("Error fetching table size:", error);
        } else {
          setTableSize(count || 0);
        }
      });
  }, [supabase, tableName]);

  const fetchPage = useCallback(
    (pageNumber: number) => {
      if (isFetching.current) return;
      isFetching.current = true;

      setIsLoading(true);
      setPage(pageNumber);

      supabase
        .from(tableName)
        .select(selectedColumns)
        .range(
          (pageNumber - 1) * LIMIT_PER_PAGE,
          pageNumber * LIMIT_PER_PAGE - 1
        )
        .then(({ data, error }) => {
          if (error || !data) {
            console.error("Error fetching books:", error);
          } else {
            console.log("Books data:", data);
            setData(data);
          }

          setIsLoading(false);
          isFetching.current = false;
        });
    },
    [selectedColumns, supabase, tableName]
  );

  useEffect(() => {
    fetchPage(1);
    findLimit();
  }, [columns, fetchPage, findLimit, supabase, tableName]);

  const visibleCols = useMemo(
    () => columns.filter((col) => col.show !== false),
    [columns]
  );

  if (isLoading) {
    return (
      <div>
        {Array.from({ length: LIMIT_PER_PAGE }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleCols.map((column) => (
              <TableHead key={column.id}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {visibleCols.map((column) => (
                <td key={column.id} className="p-2 border">
                  {row[column.name]}
                </td>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationBuilder
        currentPage={page}
        totalPages={Math.ceil(tableSize / LIMIT_PER_PAGE)}
        onPageChange={fetchPage}
      />
    </div>
  );
}

export default TableBuilder;
