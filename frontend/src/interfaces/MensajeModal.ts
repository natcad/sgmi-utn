export interface MensajeModal {
  tipo: "exito" | "error" | "warning" | "sorry";
  mensaje: string;
}