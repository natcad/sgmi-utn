export interface Grupo {
  id: number;
  nombre: string;
  correo: string;
  objetivo: string | null;
  organigrama: string | null;
  presupuesto: number | null;
  siglas: string | null;
  idDirector: number | null;
  idVicedirector: number | null;
  idFuenteDeFinanciamiento: number | null;
}
