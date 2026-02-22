import { z } from "zod";
export const grupoSchema = z.object({
  facultadRegional: z.string().min(1, "La Facultad Regional es requerida."),
  nombre: z.string().min(1, "El Nombre del grupo es requerido"),
  correo: z.string().email("Debe ingresar un correo electrónico valido."),
  siglas: z.string().min(1, "Las Siglas son requeridas."),
  objetivo: z
    .string()
    .min(1, "El objetivo es requerido.")
    .max(250, "El objetivo no puede superar los 255 caracteres."),
   director: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)).nullish(),
  vicedirector: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)).nullish(),
  integrantesCE: z.array(z.number()).nullish(),
  organigramaFile: z.any().optional(),
});
export type GrupoFormValues = z.infer<typeof grupoSchema>;
