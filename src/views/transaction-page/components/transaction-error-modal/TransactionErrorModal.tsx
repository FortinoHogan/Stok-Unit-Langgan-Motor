import AppModal from "@/components/app-components/app-modal/AppModal";
import { Button } from "@/components/ui/button";
import type { TransactionErrorModalProps } from "./TransactionErrorModal.interface";

const TransactionErrorModal = ({
  open,
  onOpenChange,
  errorMessage,
  onClose,
}: TransactionErrorModalProps) => {
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Error"
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
      <p>{errorMessage}</p>
    </AppModal>
  );
};

export default TransactionErrorModal;
