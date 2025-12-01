import api from "./api";
import { GrupoDetalle } from "@/interfaces/module/Grupos/GrupoDetalle";
import { Grupo } from "@/interfaces/module/Grupos/Grupos";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";

export const getGrupoDetalle = async (
  idGrupo: string | number
): Promise<GrupoDetalle> => {
  const res = await api.get(`/grupos/${idGrupo}`);
  const data = res.data;
  return {
    id: data.id,
    nombre: data.nombre,
    siglas: data.siglas,
    objetivo: data.objetivo,
    director: data.director,
    vicedirector: data.vicedirector,
    integrantes: data.personal|| [],    
    organigramaUrl: data.organigramaUrl,
    organigramaPublicId: data.organigramaPublicId,
    correo: data.correo,
    facultadRegional: data.faculRegional,
    idDirector:data.idDirector,
    idFacultadRegional: data.idFacultadRegional,
    idVicedirector:data.idVicedirector,
  };
};
export const getMiGrupoApi = async (): Promise<GrupoDetalle> => {
  const { data } = await api.get("/grupos/mi-grupo");
  return data;
};




export const getGrupo =async(idGrupo: string | number): Promise<Grupo>=>{
   const res = await api.get(`/grupos/${idGrupo}`);
    const data = res.data;
    const integrantes: PersonalResponse[]= data.personal || [];
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


export const validarCorreoGrupoApi = async (correo: string, idGrupo?: number) => {
  const { data } = await api.get("/grupos/validar-correo", {
    params: {
      correo,
      ...(idGrupo && { idGrupo }), 
    },
  });

  return data; 
};
