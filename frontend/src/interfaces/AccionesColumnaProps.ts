export interface AccionesColumnasProps {
  id: number | string | undefined;
  path: string;
  onEdit?: () => void;
  onDelete?: () => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}