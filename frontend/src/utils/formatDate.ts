export const formatDate = (fecha: string | Date | null) => {
  if (!fecha) return "";
  const d = new Date(fecha);

  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const año = d.getFullYear();

  return `${dia}-${mes}-${año}`;
};
