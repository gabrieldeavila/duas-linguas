import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LinkButton } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type {
  TableBuilderProps,
  TableName,
  TableRowProps,
} from "~/types/table.types";
import { PaginationBuilder } from "../pagination/builder";
import { useSupabase } from "../supabaseAuth";
import { useTranslation } from "react-i18next";

const LIMIT_PER_PAGE = 20;

function TableBuilder<T extends TableName>({
  columns,
  tableName,
}: TableBuilderProps<T>) {
  const { t } = useTranslation("general");
  const supabase = useSupabase();
  const isFetching = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [tableSize, setTableSize] = useState(0);

  const [data, setData] = useState<TableRowProps<T>[]>([]);

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
        .then(({ data: books, error }) => {
          if (error || !books) {
            console.error("Error fetching books:", error);
          } else {
            console.log("Books data:", books);
            setData(books as unknown as TableRowProps<T>[]);
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize">
          {t(`pages.admin.${tableName}.title` as never)}
        </h1>
        <LinkButton to={`/admin/${tableName}/new`}>
          {t(`pages.admin.${tableName}.buttonAddText` as never)}
        </LinkButton>
      </div>

      <div className="overflow-hidden rounded-md border">
        {isLoading ? (
          <div>
            {Array.from({ length: LIMIT_PER_PAGE }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full mb-2" />
            ))}
          </div>
        ) : (
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
                    <TableCell key={column.id}>
                      {row[column.name] != null ? String(row[column.name]) : ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <PaginationBuilder
        currentPage={page}
        totalPages={Math.ceil(tableSize / LIMIT_PER_PAGE)}
        onPageChange={fetchPage}
      />
    </div>
  );
}

export default TableBuilder;
