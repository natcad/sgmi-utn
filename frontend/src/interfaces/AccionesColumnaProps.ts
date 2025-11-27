export interface AccionesColumnasProps {
  id: number | string;
  path: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}
