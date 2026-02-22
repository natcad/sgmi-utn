export function formatHoras(horas: number | null): string {
  if (!horas) return "";
  // Si es un número entero, devolverlo como string
  return String(Math.round(horas));
}

export function formatDateFromDB(dateString: string | null | undefined): string | undefined {
  if (!dateString) return undefined;
  // Si está en formato YYYY-MM-DD (de la BD), devolverlo tal cual (formato para input date)
  if (dateString.includes("-") && dateString.length === 10) {
    return dateString;
  }
  // Si está en formato dd/mm/yyyy, convertir a YYYY-MM-DD
  if (dateString.includes("/") && dateString.length === 10) {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return dateString;
}

export function mapPersonalToFormData(data: any) {
  return {
    nombre: data.Usuario?.nombre ?? "",
    apellido: data.Usuario?.apellido ?? "",
    email: data.Usuario?.email ?? "",
    horasSemanales: formatHoras(data.horasSemanales),
    rol: data.rol ?? "",

    // investigador 
    categoriaUTN: data.categoriaUTN ?? undefined,
    dedicacion: data.dedicacion ?? undefined,

    // incentivo 
    estadoIncentivo: data.ProgramaIncentivo?.estado ?? undefined,
    fechaVencimientoIncentivo: formatDateFromDB(data.ProgramaIncentivo?.fechaVencimiento),

    // formación 
    tipoFormacion: data.tipoFormacion ?? undefined,
    fuenteOrganismo: data.fuentesDeFinanciamiento?.[0]?.organismo ?? undefined,
    fuenteMonto: data.fuentesDeFinanciamiento?.[0]?.monto ?? undefined,

    // perfil usuario
    telefono: data.Usuario?.PerfilUsuario?.telefono ?? undefined,
    fechaNacimiento: formatDateFromDB(data.Usuario?.PerfilUsuario?.fechaNacimiento),
    fotoPerfil: data.Usuario?.PerfilUsuario?.fotoPerfil ?? undefined,

    grupoId: data.grupo?.id ?? undefined,
  };
}