import AppModal from "@/components/app-components/app-modal/AppModal";
import { Button } from "@/components/ui/button";
import type { TransactionStatusModalProps } from "./TransactionStatusModal.interface";

const TransactionStatusModal = ({
  open,
  onOpenChange,
  title,
  message,
  onClose,
}: TransactionStatusModalProps) => {
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      showCloseButton={true}
      classNames={{
        content: "sm:max-w-sm",
        header: "gap-1",
        title: "text-lg",
        description: "text-xs",
        body: "space-y-3",
        footer: "bg-muted/30",
      }}
      footer={
        <div className="flex w-full justify-center">
          <Button type="button" onClick={onClose}>
            OK
          </Button>
        </div>
      }
    >
      <p>{message}</p>
    </AppModal>
  );
};

export default TransactionStatusModal;
