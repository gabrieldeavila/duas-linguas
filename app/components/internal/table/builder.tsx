import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, LinkButton } from "~/components/ui/button";
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
import { Square, SquareCheckBig } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

const LIMIT_PER_PAGE = 20;

function TableBuilder<T extends TableName>({
  columns,
  tableName,
  to,
  settings,
  tableController,
}: TableBuilderProps<T>) {
  const { t } = useTranslation("general");
  const supabase = useSupabase();
  const isFetching = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [tableSize, setTableSize] = useState(0);
  const [selectedRows, setSelectedRows] = useState<(keyof TableRowProps<T>)[]>(
    []
  );
  const [data, setData] = useState<TableRowProps<T>[]>([]);

  const selectedData = useMemo(
    () =>
      data.filter((row) => {
        if (!settings?.columnSelector) return false;

        const id = row[settings.columnSelector];

        return selectedRows.includes(id as keyof TableRowProps<T>);
      }),
    [data, selectedRows, settings?.columnSelector]
  );

  const selectedColumns = useMemo(
    () => columns.map((col) => col.name).join(", "),
    [columns]
  );

  const isFindingLimit = useRef(false);

  const findLimit = useCallback(() => {
    if (isFindingLimit.current) return;

    isFindingLimit.current = true;

    supabase
      // supabase has two overloaded from methods, so we need to cast tableName
      .from(tableName as never)
      .select("*", { count: "estimated" })
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
        .from(tableName as never)
        .select(selectedColumns)
        .order("created_at", { ascending: false })
        .range(
          (pageNumber - 1) * LIMIT_PER_PAGE,
          pageNumber * LIMIT_PER_PAGE - 1
        )
        .then(({ data: books, error }) => {
          if (error || !books) {
            console.error("Error fetching books:", error);
          } else {
            setData(books as unknown as TableRowProps<T>[]);
          }

          setIsLoading(false);
          isFetching.current = false;
        });
    },
    [selectedColumns, supabase, tableName]
  );

  const handleDelete = useCallback(() => {
    if (selectedRows.length === 0 || !settings?.columnSelector) return;
    toast.loading(t("loading.deleting"));
    setIsDeleting(true);

    supabase
      .from(settings?.tableToDeleteFrom ?? (tableName as never))
      .delete()
      .in(settings?.columnSelector as string, selectedRows as string[])
      .then(({ error }) => {
        toast.dismiss();

        if (error) {
          toast.error(t("error.deleting"));
          console.error("Error deleting items:", error);
        } else {
          toast.success(t("success.deleting"));
          setSelectedRows([]);
          fetchPage(1);
          findLimit();
        }
        setIsDeleting(false);
      });
  }, [
    selectedRows,
    settings?.columnSelector,
    settings?.tableToDeleteFrom,
    t,
    supabase,
    tableName,
    fetchPage,
    findLimit,
  ]);

  useEffect(() => {
    fetchPage(1);
    findLimit();
  }, [columns, fetchPage, findLimit, supabase, tableName]);

  const selectRow = useCallback(
    (row: TableRowProps<T>) => {
      if (!settings?.columnSelector) return;

      const id = row[settings.columnSelector] as keyof TableRowProps<T>;

      setSelectedRows((prev) => {
        if (settings?.singleSelection) {
          return [id];
        }

        if (prev.includes(id)) {
          return prev.filter((rowId) => rowId !== id);
        } else {
          return [...prev, id];
        }
      });
    },
    [settings?.columnSelector, settings?.singleSelection]
  );

  const visibleCols = useMemo(
    () => columns.filter((col) => col.show !== false),
    [columns]
  );

  useImperativeHandle(
    tableController,
    () => ({
      selectedRows,
      selectedData,
    }),
    [selectedData, selectedRows]
  );

  const routeTo = useMemo(() => {
    if (to) return to;

    return `/admin/${tableName}`;
  }, [tableName, to]);

  return (
    <div
      className="flex flex-col gap-2 overflow-auto"
      style={settings?.limitHeight ? { maxHeight: "600px" } : undefined}
    >
      {!settings?.hideAdd && (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold capitalize">
              {t(
                (settings?.buttons?.title ??
                  `pages.admin.${tableName}.title`) as never
              )}
            </h1>
            <div className="flex gap-2">
              {settings?.deleteItems && selectedRows.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {t("deleteSelected")} ({selectedRows.length})
                </Button>
              )}

              <LinkButton to={`${routeTo}/new`}>
                {t(
                  (settings?.buttons?.buttonText ??
                    `pages.admin.${tableName}.buttonAddText`) as never
                )}
              </LinkButton>
            </div>
          </div>
        </>
      )}

      <div className="overflow-auto rounded-md border">
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
                {/* add checkbox */}
                {settings?.columnSelector && (
                  <TableHead className="w-8">
                    {!settings?.singleSelection && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (selectedRows.length === data.length) {
                            setSelectedRows([]);
                          } else {
                            setSelectedRows(
                              data.map(
                                (row) =>
                                  row[
                                    settings.columnSelector as keyof TableRowProps<T>
                                  ] as keyof TableRowProps<T>
                              )
                            );
                          }
                        }}
                      >
                        {selectedRows.length === data.length ? (
                          <SquareCheckBig />
                        ) : (
                          <Square />
                        )}
                      </Button>
                    )}
                  </TableHead>
                )}

                {visibleCols.map((column) => (
                  <TableHead key={column.id}>{column.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {settings?.columnSelector && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          selectRow(row);
                        }}
                      >
                        {selectedRows.includes(
                          row[settings.columnSelector] as keyof TableRowProps<T>
                        ) ? (
                          <SquareCheckBig />
                        ) : (
                          <Square />
                        )}
                      </Button>
                    </TableCell>
                  )}

                  {visibleCols.map((column) => (
                    <TableCell key={column.id}>
                      <Link
                        to={`${routeTo}/edit/${"id" in row ? row.id : ""}`}
                        className="flex w-full"
                      >
                        {row[column.name] != null
                          ? String(row[column.name])
                          : ""}
                      </Link>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {tableSize === 0 ? null : (
        <PaginationBuilder
          currentPage={page}
          totalPages={Math.ceil(tableSize / LIMIT_PER_PAGE)}
          onPageChange={fetchPage}
        />
      )}
    </div>
  );
}

export default TableBuilder;
