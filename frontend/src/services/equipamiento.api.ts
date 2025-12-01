import api from "@/services/api";
import { Equipamiento } from "@/interfaces/module/Equipamiento/Equipamiento";
import { ResumenEquipamiento } from "@/interfaces/module/Equipamiento/ResumenEquipamiento";

export async function getEquipamiento(grupoId?:number): Promise<Equipamiento[]> {
  const url = grupoId ? `/equipamiento?grupoId=${grupoId}` : "/equipamiento";
  const response = await api.get<Equipamiento[]>(url);
  return response.data;
}
export async function createEquipamiento(
  nuevoEquipamiento: Partial<Equipamiento>){
    const {data} = await api.post<Equipamiento>("/equipamiento", nuevoEquipamiento);
    return data;
}
export async function updateEquipamiento(
  id: number,
  equipamientoActualizado: Partial<Equipamiento>) {
    const {data} = await api.put<Equipamiento>(`/equipamiento/${id}`, equipamientoActualizado);
    return data;
}
export async function deleteEquipamiento(id: number) {
    await api.delete(`/equipamiento/${id}`);
}
export async function getResumenEquipamiento(): Promise<ResumenEquipamiento[]> {
  const response = await api.get<ResumenEquipamiento[]>("/equipamiento/resumen");
  return response.data;
}