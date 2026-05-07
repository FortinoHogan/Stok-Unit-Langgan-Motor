import AppModal from "@/components/app-components/app-modal/AppModal";
import AppTable from "@/components/app-components/app-table/AppTable";
import { Button } from "@/components/ui/button";
import type { TransactionTableSectionProps } from "./TransactionTableSection.interface";

const TransactionTableSection = (props: TransactionTableSectionProps) => {
  const {
    table,
    emptyMessage,
    detailOpen,
    onDetailOpenChange,
    detailTitle,
    detailRows,
  } = props;
  return (
    <>
      <AppTable table={table} showNumberColumn emptyMessage={emptyMessage} />

      <AppModal
        open={detailOpen}
        onOpenChange={onDetailOpenChange}
        title={detailTitle || "Detail"}
        showCloseButton={true}
        classNames={{
          content: "sm:max-w-lg",
          body: "space-y-2",
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
        {detailRows.length ? (
          detailRows.map((item) => (
            <div
              key={item.transactionId}
              className="rounded-md border p-2 text-sm"
            >
              <p>No Mesin: {item.noMesin || "-"}</p>
              <p>No Rangka: {item.noRangka || "-"}</p>
              <p>
                Date DO:{" "}
                {item.dateDO
                  ? new Intl.DateTimeFormat("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(item.dateDO))
                  : "-"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No detail found.</p>
        )}
      </AppModal>
    </>
  );
};

export default TransactionTableSection;
