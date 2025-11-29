export interface Grupo {
  id: number;
  nombre: string;
  correoelectronico: string;
  objetivo: string | null;
  organigrama: string | null;
  presupuesto: number | null;
  siglas: string | null;
  idDirector: number | null | undefined;
  idVicedirector: number | null | undefined;
  idFuenteDeFinanciamiento: number | null;
  facultadRegional: string; 
}
