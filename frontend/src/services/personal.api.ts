// services/personal.api.ts
import api from "@/services/api";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";

export const getPersonal = async (): Promise<PersonalResponse[]> => {
  const res = await api.get("/personal"); // ajustá la ruta si es distinta
    return (res.data || []) as PersonalResponse[];
};
