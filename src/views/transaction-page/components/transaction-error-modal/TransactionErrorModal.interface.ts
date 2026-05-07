export interface TransactionErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage: string;
  onClose: () => void;
}
