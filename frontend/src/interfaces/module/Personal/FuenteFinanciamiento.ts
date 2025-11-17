export interface FuenteFinanciamiento {
  id: number;
  enFormacionId: number;
  organismo: string;
  monto: Float16Array;
  createdAt: Date;
  updatedAt: Date;
}
