import api from "./api";
import { GrupoDetalle } from "@/interfaces/module/Grupos/GrupoDetalle";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";

export const getGrupoDetalle = async (
    idGrupo: string | number
): Promise<GrupoDetalle> =>{
    const res = await api.get(`/grupos/${idGrupo}`);
    const data = res.data;
    const integrantes: PersonalResponse[]= data.personal || data.integrantes || [];
    return{
        ...data,
        integrantes,
    }
}

export const getOrganigramaUrl = (idGrupo: string | number) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  return `${baseUrl}/api/grupos/${idGrupo}/organigrama`;
};

export const actualizarGrupoApi = async (
  idGrupo: string | number,
  payload: Partial<GrupoDetalle>
): Promise<GrupoDetalle> => {
  const res = await api.put(`/grupos/${idGrupo}`, payload);
  return res.data as GrupoDetalle;
};

export const eliminarGrupoApi = async (
  idGrupo: string | number
): Promise<void> => {
  await api.delete(`/grupos/${idGrupo}`);
};
