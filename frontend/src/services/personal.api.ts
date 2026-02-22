// services/personal.api.ts
import api from "@/services/api";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";

export interface CatalogosPersonal {
  roles: string[];
  tiposFormacion: string[];
  categoriasUTN: string[];
  dedicaciones: string[];
  estadosIncentivo: string[];
}

export const getPersonal = async (): Promise<PersonalResponse[]> => {
  const res = await api.get("/personal");
  return (res.data || []) as PersonalResponse[];
};

export const getCatalogosPersonal = async (): Promise<CatalogosPersonal> => {
  const res = await api.get<CatalogosPersonal>("/personal/catalogos");
  return res.data;
};
