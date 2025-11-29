export interface ModalEliminarProps {
  isOpen: boolean;
  title?: string;
  message: string;
  warning?: string;
  onCancel: () => void;
  onConfirm: () => void;
  baseClassName?: string;
}
