export interface AccionesColumnasProps {
  id: number | string;
  path: string;
  onEdit?: () => void;
  onDelete?: (id: number | string) => void;
  onView?: (id: number | string) => void;
}
