import api from "./api";
import { Grupo } from "@/interfaces/module/Grupos/Grupos";
export async function getGrupos(): Promise<Grupo[]> {
  const response = await api.get<Grupo[]>("/grupos");
  return response.data;
}

export async function getGrupoById(id: number): Promise<Grupo> {
  const response = await api.get<Grupo>(`/grupos/${id}`);
  return response.data;
}