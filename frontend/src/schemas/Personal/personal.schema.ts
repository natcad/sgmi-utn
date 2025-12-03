import { z } from "zod";

export const personalSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Debe ingresar un correo electrónico válido"),
  telefono: z.union([
    z.number().positive("El teléfono debe ser un número positivo"),
    z.string().regex(/^\d+$/, "El teléfono debe contener solo números")
  ]).optional().transform((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    if (typeof val === "string" && val.trim() === "") return undefined;
    if (typeof val === "number" && isNaN(val)) return undefined;
    return typeof val === "string" ? Number(val) : val;
  }).refine((val) => {
    if (val === undefined || val === null) return true;
    if (typeof val === "number") {
      return !isNaN(val) && val > 0;
    }
    if (typeof val === "string") {
      return /^\d+$/.test(val);
    }
    return false;
  }, {
    message: "El teléfono debe contener solo números",
  }),
  fechaNacimiento: z.string().optional().transform((val) => (val === "" ? undefined : val)).nullish(),
  fotoPerfil: z.string().optional(),
  fotoPerfilFile: z.any().optional(),
  eliminarFotoPerfil: z.boolean().optional(),

  grupoId: z.union([
    z.string().min(1, "El grupo es requerido"),
    z.number()
  ]).transform((val) => typeof val === "string" ? Number(val) : val),
  horasSemanales: z.preprocess((val) => {
    if (val === null || val === undefined || (typeof val === "number" && isNaN(val))) {
      return "";
    }
    return val;
  }, z.union([
    z.string().min(1, "Las horas semanales son requeridas").regex(/^\d+$/, "Debe ser un número entero"),
    z.number().int().positive("Las horas semanales deben ser un número entero positivo")
  ]).transform((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = typeof val === "string" ? Number(val) : val;
    return isNaN(num) ? undefined : Math.round(num);
  })),
  rol: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    return val;
  }, z.enum([
    "Personal Profesional",
    "Personal Técnico",
    "Personal Administrativo",
    "Personal de Apoyo",
    "Investigador",
    "Personal en Formación"
  ] as const).refine((val) => val !== undefined, {
    message: "El rol es requerido",
  })),

  categoriaUTN: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return val;
  }, z.enum(["A", "B", "C", "D", "E"]).optional()),
  dedicacion: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return val;
  }, z.enum(["Simple", "Semiexclusiva", "Exclusiva"]).optional()),
  estadoIncentivo: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return val;
  }, z.enum(["Inactivo", "Activo"]).optional()),
  fechaVencimientoIncentivo: z.string().optional().transform((val) => (val === "" ? undefined : val)).nullish(),

  tipoFormacion: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return val;
  }, z.enum([
    "Doctorado",
    "Maestría/ Especialización",
    "Becario Graduado",
    "Becario Alumno",
    "Pasante",
    "Tesis"
  ]).optional()),
  fuenteOrganismo: z.string().optional(),
  fuenteMonto: z.preprocess((val) => {
    if (val === null || val === undefined || val === "" || (typeof val === "number" && isNaN(val))) {
      return undefined;
    }
    return val;
  }, z.union([
    z.number().positive("El financiamiento debe ser un número positivo"),
    z.string().regex(/^\d+(\.\d+)?$/, "El financiamiento debe ser un número")
  ]).optional().transform((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    const num = typeof val === "string" ? Number(val) : val;
    return isNaN(num) ? undefined : num;
  })),
}).refine((data) => {
  if (data.rol === "Investigador") {
    return data.categoriaUTN && data.dedicacion && data.estadoIncentivo;
  }
  return true;
}, {
  message: "Los campos de Investigador son requeridos",
  path: ["categoriaUTN"],
}).refine((data) => {
  if (data.rol === "Investigador" && data.estadoIncentivo === "Activo") {
    return !!data.fechaVencimientoIncentivo;
  }
  return true;
}, {
  message: "La fecha de vencimiento es requerida para incentivo activo",
  path: ["fechaVencimientoIncentivo"],
}).refine((data) => {
  if (data.rol === "Personal en Formación") {
    return !!data.tipoFormacion;
  }
  return true;
}, {
  message: "El tipo de formación es requerido",
  path: ["tipoFormacion"],
}).refine((data) => {
  if (data.rol === "Personal en Formación" && data.tipoFormacion === "Doctorado") {
    if (!data.fuenteOrganismo || 
        (typeof data.fuenteOrganismo === "string" && data.fuenteOrganismo.trim() === "")) {
      return false;
    }
  }
  return true;
}, {
  message: "El organismo es requerido",
  path: ["fuenteOrganismo"],
}).refine((data) => {
  if (data.rol === "Personal en Formación" && data.tipoFormacion === "Doctorado") {
    if (data.fuenteMonto === undefined || 
        data.fuenteMonto === null || 
        (typeof data.fuenteMonto === "number" && (isNaN(data.fuenteMonto) || data.fuenteMonto <= 0))) {
      return false;
    }
  }
  return true;
}, {
  message: "El financiamiento es requerido",
  path: ["fuenteMonto"],
});

export type PersonalFormValues = z.infer<typeof personalSchema>;

