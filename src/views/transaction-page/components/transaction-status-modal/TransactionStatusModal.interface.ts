export interface TransactionStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  onClose: () => void;
}
