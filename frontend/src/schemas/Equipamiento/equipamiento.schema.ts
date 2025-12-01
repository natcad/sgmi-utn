import { z } from "zod";

const dateSanitizer = z
  .string()
  .min(1, "La fecha es obligatoria")
  .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: "La fecha no es válida",
  });

export const equipamientoSchema = z.object({
  denominacion: z
    .string()
    .trim()
    .min(3, "La denominación debe tener al menos 3 caracteres")
    .max(100, "La denominación no puede exceder los 100 caracteres"),

  descripcion: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(300, "La descripción no puede exceder los 300 caracteres"),

  // ⬅⭐ ACEPTA number O string y lo transforma SIEMPRE a number
  montoInvertido: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((n) => !isNaN(n), "Debe ser un número válido")
    .refine((n) => n >= 0, "El monto invertido debe ser mayor o igual a 0"),

  fechaIncorporacion: dateSanitizer,

  // ⬅⭐ ACEPTA number O string y lo transforma SIEMPRE a number
  cantidad: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((n) => Number.isInteger(n), "Debe ser un número entero")
    .refine((n) => n > 0, "La cantidad debe ser mayor a 0"),

  // ⬅⭐ grupoId opcional, acepta string o number
  grupoId: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) =>
      v === "" || v === undefined ? undefined : Number(v)
    ),
});

export type EquipamientoFormData = z.infer<typeof equipamientoSchema>;
