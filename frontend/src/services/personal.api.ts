import api from "./api";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";

export const getPersonal = async () :Promise<PersonalResponse[]> => {
  const res = await api.get<PersonalResponse[]>("/personal");
  return res.data || [];
};
