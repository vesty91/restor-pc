"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** Clé stable pour la sélection / React keys. */
  getRowId?: (row: TData, index: number) => string;
  /** Recherche texte (client) — désactiver si filtrage serveur. */
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  /** Mode serveur : pagination manuelle. */
  manualPagination?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  /** Mode serveur : tri manuel. */
  manualSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  loading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Affiche des cartes empilées sous `md`. */
  mobileCards?: boolean;
  /** Nombre de skeletons pendant le chargement. */
  skeletonRows?: number;
  className?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
};

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ChevronUp className="size-3.5" aria-hidden />;
  if (sorted === "desc") return <ChevronDown className="size-3.5" aria-hidden />;
  return <ChevronsUpDown className="size-3.5 opacity-40" aria-hidden />;
}

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  globalFilter,
  onGlobalFilterChange,
  manualPagination = false,
  pageCount,
  pagination,
  onPaginationChange,
  manualSorting = false,
  sorting,
  onSortingChange,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  loading = false,
  error = null,
  emptyTitle = "Aucun résultat",
  emptyDescription = "Modifiez les filtres ou réessayez plus tard.",
  mobileCards = true,
  skeletonRows = 5,
  className,
  toolbar,
  footer,
}: DataTableProps<TData>) {
  const cols = useMemo(() => columns, [columns]);

  const table = useReactTable({
    data,
    columns: cols,
    getRowId,
    state: {
      ...(sorting !== undefined ? { sorting } : {}),
      ...(pagination !== undefined ? { pagination } : {}),
      ...(rowSelection !== undefined ? { rowSelection } : {}),
      ...(globalFilter !== undefined ? { globalFilter } : {}),
    },
    onSortingChange,
    onPaginationChange,
    onRowSelectionChange,
    onGlobalFilterChange: onGlobalFilterChange
      ? (updater) => {
          const next =
            typeof updater === "function" ? updater(globalFilter ?? "") : updater;
          onGlobalFilterChange(String(next ?? ""));
        }
      : undefined,
    manualPagination,
    manualSorting,
    pageCount: manualPagination ? pageCount : undefined,
    enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel:
      manualPagination || onGlobalFilterChange === undefined
        ? undefined
        : getFilteredRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;
  const colCount = table.getVisibleLeafColumns().length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const canPrev = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();

  return (
    <div className={cn("space-y-4", className)}>
      {toolbar ? <div className="flex flex-wrap items-end gap-3">{toolbar}</div> : null}

      {error ? (
        <p role="alert" className="rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {/* Desktop table */}
      <div className={cn(mobileCards && "hidden md:block")}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-teal"
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          aria-sort={
                            sorted === "asc"
                              ? "ascending"
                              : sorted === "desc"
                                ? "descending"
                                : "none"
                          }
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIcon sorted={sorted} />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {Array.from({ length: colCount }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[8rem]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colCount} className="py-10 text-center whitespace-normal">
                  <p className="font-medium text-ink">{emptyTitle}</p>
                  <p className="mt-1 text-sm text-ink-muted">{emptyDescription}</p>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  tabIndex={0}
                  className="outline-none focus-visible:bg-teal/5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal"
                  onKeyDown={(e) => {
                    if (!enableRowSelection) return;
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      row.toggleSelected();
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.id === "actions" && "whitespace-normal"
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      {mobileCards ? (
        <div className="space-y-3 md:hidden" role="list">
          {loading ? (
            Array.from({ length: Math.min(skeletonRows, 3) }).map((_, i) => (
              <div key={i} className="rounded-[16px] border border-line p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-3 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            ))
          ) : rows.length === 0 ? (
            <div className="rounded-[16px] border border-line px-4 py-8 text-center">
              <p className="font-medium text-ink">{emptyTitle}</p>
              <p className="mt-1 text-sm text-ink-muted">{emptyDescription}</p>
            </div>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                role="listitem"
                className="rounded-[16px] border border-line bg-paper p-4 space-y-2"
                data-state={row.getIsSelected() ? "selected" : undefined}
              >
                {row.getVisibleCells().map((cell) => {
                  const header = cell.column.columnDef.header;
                  const label =
                    typeof header === "string"
                      ? header
                      : cell.column.id === "actions"
                        ? "Actions"
                        : cell.column.id;
                  return (
                    <div key={cell.id} className="flex flex-col gap-0.5 text-sm">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                        {label}
                      </span>
                      <div className="text-ink">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-muted">
          Page {pageIndex + 1}
          {manualPagination && pageCount != null
            ? ` / ${Math.max(pageCount, 1)}`
            : ""}
          {" · "}
          {pageSize} / page
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={!canPrev || loading}
            onClick={() => table.previousPage()}
          >
            Précédent
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={!canNext || loading}
            onClick={() => table.nextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>

      {footer}
    </div>
  );
}
