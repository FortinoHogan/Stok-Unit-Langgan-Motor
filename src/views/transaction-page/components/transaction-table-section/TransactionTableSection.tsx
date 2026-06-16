import {
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table";
import { CircleDollarSign, FilePen, Pencil, Printer, Trash } from "lucide-react";
import AppModal from "@/components/app-components/app-modal/AppModal";
import AppTable from "@/components/app-components/app-table/AppTable";
import { Button } from "@/components/ui/button";
import type { TransactionDetailRow } from "@/interfaces/ITransactionService";
import type { TransactionTableSectionProps } from "./TransactionTableSection.interface";

const TransactionTableSection = (props: TransactionTableSectionProps) => {
  const {
    table,
    isLoading = false,
    page = 1,
    pageSize = 10,
    rowCount = 0,
    hasNextPage = false,
    onPreviousPage,
    onNextPage,
    onPageSizeChange,
    emptyMessage,
    detailOpen,
    onDetailOpenChange,
    detailTitle,
    detailRows,
    canUpdateDetail = false,
    canDeleteDetail = false,
    canSellDetail = false,
    onEditDetailRow,
    onDeleteDetailRow,
    onSellDetailRow,
    onEditSellingDetailRow,
    onPrintDetailRow,
  } = props;

  const detailColumns: ColumnDef<TransactionDetailRow>[] = [
    {
      accessorKey: "colorName",
      header: "Color",
      cell: ({ row }) => row.original.colorName || "-",
    },
    {
      accessorKey: "noMesin",
      header: "No Mesin",
    },
    {
      accessorKey: "noRangka",
      header: "No Rangka",
    },
    {
      accessorKey: "year",
      header: "Year",
      cell: ({ row }) => row.original.year || "-",
    },
    {
      accessorKey: "isRFS",
      header: "Status",
      cell: ({ row }) =>
        row.original.isRFS
          ? "RFS"
          : "NRFS",
    },
    {
      accessorKey: "dateDO",
      header: "Date DO",
      cell: ({ row }) => {
        const value = row.original.dateDO;
        return value
          ? new Intl.DateTimeFormat("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date(value))
          : "-";
      },
    },
    {
      accessorKey: "dateOUT",
      header: "Date OUT",
      cell: ({ row }) => {
        const value = row.original.dateOUT;
        return value
          ? new Intl.DateTimeFormat("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date(value))
          : "-";
      },
    },
  ];

  if (onEditDetailRow || onDeleteDetailRow || onSellDetailRow) {
    detailColumns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {canSellDetail && onSellDetailRow && row.original.isRFS && !row.original.dateOUT ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              title="Mark as sold"
              onClick={() => onSellDetailRow(row.original)}
            >
              <CircleDollarSign className="size-4" />
            </Button>
          ) : null}
          {canSellDetail && onEditSellingDetailRow && row.original.dateOUT ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              title="Edit selling detail"
              onClick={() => onEditSellingDetailRow(row.original)}
            >
              <FilePen className="size-4" />
            </Button>
          ) : null}
          {onPrintDetailRow && (row.original.dateOUT || row.original.transactionDetailId) ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              title="Print surat jalan"
              onClick={() => onPrintDetailRow(row.original)}
            >
              <Printer className="size-4" />
            </Button>
          ) : null}
          {canUpdateDetail && onEditDetailRow ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              title="Edit transaction"
              onClick={() => onEditDetailRow(row.original)}
            >
              <Pencil className="size-4" />
            </Button>
          ) : null}
          {canDeleteDetail && onDeleteDetailRow ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              title="Delete transaction"
              onClick={() => onDeleteDetailRow(row.original)}
            >
              <Trash className="size-4" />
            </Button>
          ) : null}
        </div>
      ),
    });
  }

  const detailTable = useReactTable({
    data: detailRows,
    columns: detailColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <AppTable
        table={table}
        isLoading={isLoading}
        loadingRowCount={6}
        showNumberColumn
        emptyMessage={emptyMessage}
        showPagination
        page={page}
        pageSize={pageSize}
        rowCount={rowCount}
        hasNextPage={hasNextPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onPageSizeChange={onPageSizeChange}
      />

      <AppModal
        open={detailOpen}
        onOpenChange={onDetailOpenChange}
        title={detailTitle || "Detail"}
        showCloseButton={true}
        classNames={{
          content: "sm:max-w-5xl max-h-[calc(100dvh-2rem)] overflow-hidden",
          body: "space-y-2 max-h-[calc(100dvh-12rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          footer: "bg-muted/30",
        }}
        footer={
          <div className="flex w-full justify-center">
            <Button type="button" onClick={() => onDetailOpenChange(false)}>
              Close
            </Button>
          </div>
        }
      >
        <AppTable
          table={detailTable}
          showNumberColumn
          columnsCount={detailColumns.length}
          emptyMessage="No detail found."
        />
      </AppModal>
    </>
  );
};

export default TransactionTableSection;
