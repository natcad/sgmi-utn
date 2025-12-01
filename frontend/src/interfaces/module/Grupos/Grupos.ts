
export interface Grupo {
  id: number;
  nombre: string;
  correo: string;
  objetivo: string | null;
  organigrama: string | null;
  presupuesto: number | null;
  siglas: string | null;
  idDirector: number | null | undefined;
  idVicedirector:  number | null | undefined;
  idFuenteDeFinanciamiento: string| number | null;
  idFacultadRegional:string| number | null | undefined;  
}
