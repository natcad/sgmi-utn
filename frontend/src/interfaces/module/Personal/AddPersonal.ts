export type RolPersonal =
  | "Personal Profesional"
  | "Personal Técnico"
  | "Personal Administrativo"
  | "Personal de Apoyo"
  | "Investigador"
  | "Personal en Formación";

export type TipoFormacion =
  | "Doctorado"
  | "Maestría/ Especialización"
  | "Becario Graduado"
  | "Becario Alumno"
  | "Pasante"
  | "Tesis";

export type CategoriaUTN = "A" | "B" | "C" | "D" | "E";

export type Dedicacion = "Simple" | "Semiexclusiva" | "Exclusiva";

export type EstadoIncentivo = "Inactivo" | "Activo";

export interface FormAddPersonal {
  nombre: string;
  apellido: string;
  email: string;
  horasSemanales: number | string;
  rol: RolPersonal | "";
  categoriaUTN?: CategoriaUTN;
  dedicacion?: Dedicacion;
  incentivoId?: number | null;
  estadoIncentivo?: EstadoIncentivo;
  fechaVencimientoIncentivo?: string;
  tipoFormacion?: TipoFormacion;
  fuenteOrganismo?: string;
  fuenteMonto?: number;
  telefono?: string;
  fechaNacimiento?: string;
  fotoPerfil?: string;
}

export function convertirHoras(valor: string | number): number {
  // Si ya es un número, redondearlo y devolverlo
  if (typeof valor === "number") {
    return Math.round(valor);
  }
  // Si es string, convertirlo a número y redondear
  const num = Number(valor);
  return isNaN(num) ? 0 : Math.round(num);
}

export function buildPayload(
  form: FormAddPersonal,
  usuarioId: number,
  grupoId: number
) {
  let horas = convertirHoras(form.horasSemanales);
  const base: any = {
    usuarioId,
    grupoId,
    nombre: form.nombre,
    apellido: form.apellido,
    email: form.email,
    horasSemanales: horas,
    rol: form.rol,
    ObjectType:
      form.rol === "Investigador"
        ? "investigador"
        : form.rol === "Personal en Formación"
        ? "en formación"
        : "personal",
  };

  // Solo incluir nivelDeFormacion si el rol es "Personal en Formación"
  if (form.rol === "Personal en Formación" && form.tipoFormacion) {
    base.nivelDeFormacion = form.tipoFormacion;
  }

  if (form.rol === "Investigador") {
    base.Investigador = {
      categoriaUTN: form.categoriaUTN,
      dedicacion: form.dedicacion,
      idIncentivo: form.incentivoId ?? null,
    };
  }

  if (form.rol === "Personal en Formación") {
    const fuentes = [];

    if (form.tipoFormacion === "Doctorado" && form.fuenteOrganismo && form.fuenteMonto) {
      fuentes.push({
        organismo: form.fuenteOrganismo,
        monto: form.fuenteMonto,
      });
    }

    base.EnFormacion = {
      tipoFormacion: form.tipoFormacion,
      fuentesDeFinanciamiento: fuentes,
    };
  }

  // Agregar PerfilUsuario si hay datos
  if (form.telefono || form.fechaNacimiento || form.fotoPerfil) {
    base.PerfilUsuario = {
      telefono: form.telefono || null,
      fechaNacimiento: form.fechaNacimiento || null,
      fotoPerfil: form.fotoPerfil || null,
    };
  }

  return base;
}
