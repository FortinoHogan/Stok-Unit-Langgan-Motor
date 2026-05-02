import type React from "react";
import type { Table as TanStackTable } from "@tanstack/react-table";

export interface AppTableClassNames {
  wrapper?: string;
  tableContainer?: string;
  table?: string;
  headerCell?: string;
  sortButton?: string;
  bodyRow?: string;
  bodyCell?: string;
  emptyCell?: string;
  paginationWrapper?: string;
  paginationInfo?: string;
  paginationActions?: string;
  pageSizeSelect?: string;
}

export interface AppTablePaginationContext {
  page: number;
  pageSize: number;
  rowCount: number;
  hasNextPage: boolean;
  canPreviousPage: boolean;
  pageSizeOptions: number[];
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageSizeChange?: (nextPageSize: number) => void;
}

export interface AppTableProps<TData> {
  table: TanStackTable<TData>;
  columnsCount?: number;
  showNumberColumn?: boolean;
  numberColumnHeader?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  enableSorting?: boolean;
  classNames?: AppTableClassNames;

  wrapperProps?: Omit<React.ComponentProps<"div">, "children" | "className">;
  tableContainerProps?: Omit<
    React.ComponentProps<"div">,
    "children" | "className"
  >;
  tableProps?: Omit<React.ComponentProps<"table">, "children" | "className">;

  showPagination?: boolean;
  page?: number;
  pageSize?: number;
  rowCount?: number;
  hasNextPage?: boolean;
  pageSizeOptions?: number[];
  rowsPerPageLabel?: React.ReactNode;
  pageInfoRenderer?: (context: AppTablePaginationContext) => React.ReactNode;

  onPreviousPage?: () => void;
  onNextPage?: () => void;
  onPageSizeChange?: (nextPageSize: number) => void;

  paginationRenderer?: (context: AppTablePaginationContext) => React.ReactNode;
}
