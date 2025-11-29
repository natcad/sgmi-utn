import api from "./api";
import { Facultad } from "@/interfaces/module/Grupos/Facultad";

export const getFacultad = async () :Promise<Facultad[]> => {
  const res = await api.get<Facultad[]>("/facultades-regionales");
  return res.data || [];
};
