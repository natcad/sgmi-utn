"use client";

import { FaXmark } from "react-icons/fa6";
import ModalMensaje from "@/components/ModalMensaje";
import { useState } from "react";
import { createEquipamiento } from "@/services/equipamiento.api";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
export default function EquipamientoModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [denominacion, setDenominacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [montoInvertido, setMontoInvertido] = useState<number | "">("");
  const [fechaIncorporacion, setFechaIncorporacion] = useState("");
  const [cantidad, setCantidad] = useState<number | "">("");
  const [mensaje, setMensaje] = useState<MensajeModal | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createEquipamiento({
        denominacion,
        descripcion,
        montoInvertido:
          montoInvertido === "" ? undefined : Number(montoInvertido),
        fechaIncorporacion:
          fechaIncorporacion === "" ? undefined : new Date(fechaIncorporacion),
        cantidad: cantidad === "" ? undefined : cantidad,
      });
      setMensaje({ tipo: "exito", mensaje: "Equipamiento creado con éxito." });
      setTimeout(() => {
        resetForm();
        onClose();
        onSuccess();
      }, 3200);
    } catch (error) {
      console.error("Error al crear el equipamiento:", error);
      setMensaje({ tipo: "error", mensaje: "Error al crear el equipamiento." });
    }
    setLoading(false);
  }
  function resetForm() {
    setDenominacion("");
    setFechaIncorporacion("");
    setMontoInvertido("");
    setDescripcion("");
    setCantidad("");
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Agregar Equipamiento</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FaXmark />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form__group">
              <label>Denominación:</label>
              <input
                type="text"
                value={denominacion}
                onChange={(e) => setDenominacion(e.target.value)}
                required
              />
            </div>
            <div className="form__group">
              <label>Descripción:</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />
            </div>
            <div className="form__group">
              <label>Monto Invertido:</label>
              <input
                type="number"
                value={montoInvertido === "" ? "" : montoInvertido.toString()}
                onChange={(e) =>
                  setMontoInvertido(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                required
              />
            </div>
            <div className="form__group">
              <label>Fecha de Incorporación:</label>
              <input
                type="date"
                value={fechaIncorporacion}
                onChange={(e) => setFechaIncorporacion(e.target.value)}
                required
              />
            </div>
            <div className="form__group">
              <label>Cantidad:</label>
              <input
                type="number"
                value={cantidad === "" ? "" : cantidad}
                onChange={(e) =>
                  setCantidad(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                required
              />
            </div>
            <div className="form__actions">
              <button type="submit" className={`form__submit-btn ${loading ? "btn--disabled" : ""}`}
                disabled={loading}>
                {loading ? (
                  <span className="btn-spinner"></span>
                ) : (
                  "Guardar"
                )}
              </button>
            </div>
            {mensaje && (
              <ModalMensaje
                tipo={mensaje.tipo}
                mensaje={mensaje.mensaje}
                onClose={() => {
                  setMensaje(null);
                  if (mensaje.tipo === "exito") {
                    onClose();
                    resetForm();
                    onSuccess?.();
                  }
                }}
              />
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
