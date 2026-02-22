export interface ResumenEquipamiento{
    totalEquipamientos: number;
    montoTotalInvertido: number;
    grupoId?:number;
    grupo?:{
        id:number;
        nombre:string;
        siglas:string;
        presupuesto:number;
    }

}