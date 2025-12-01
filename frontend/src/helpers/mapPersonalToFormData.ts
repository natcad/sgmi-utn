export function formatHoras(decimal: number | null): string {
  if (!decimal) return "";
  const hh = Math.floor(decimal);
  const mm = Math.round((decimal % 1) * 60);
  return `${hh}:${mm.toString().padStart(2, "0")}`;
}

export function formatDateFromDB(dateString: string | null | undefined): string {
  if (!dateString) return "";
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
    legajo: data.legajo ?? "",
    horasSemanales: formatHoras(data.horasSemanales),
    rol: data.rol ?? "",

    // investigador
    categoriaUTN: data.categoriaUTN ?? "",
    dedicacion: data.dedicacion ?? "",

    // incentivo
    estadoIncentivo: data.ProgramaIncentivo?.estado ?? "",
    fechaVencimientoIncentivo: formatDateFromDB(data.ProgramaIncentivo?.fechaVencimiento),

    // formación
    tipoFormacion: data.tipoFormacion ?? "",
    fuenteOrganismo: data.fuentesDeFinanciamiento?.[0]?.organismo ?? "",
    fuenteMonto: data.fuentesDeFinanciamiento?.[0]?.monto ?? 0,

    // perfil usuario
    telefono: data.Usuario?.PerfilUsuario?.telefono ?? "",
    fechaNacimiento: formatDateFromDB(data.Usuario?.PerfilUsuario?.fechaNacimiento),
    fotoPerfil: data.Usuario?.PerfilUsuario?.fotoPerfil ?? "",

    grupoId: data.grupo?.id ?? undefined,
  };
}