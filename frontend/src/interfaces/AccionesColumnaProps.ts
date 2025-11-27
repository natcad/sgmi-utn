export interface AccionesColumnasProps {
  id: number | string;
  path: string;
  onEdit?: () => void;
  onDelete?: () => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}
