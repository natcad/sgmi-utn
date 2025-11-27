"use client";
import { FaXmark } from "react-icons/fa6";
import ModalMensaje from "@/components/ModalMensaje";
import { useState, useEffect } from "react";
import {
  createEquipamiento,
  updateEquipamiento,
} from "@/services/equipamiento.api";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import { useAuth } from "@/context/AuthContext";
import { getGrupos } from "@/services/grupos.api";
import { Grupo } from "@/interfaces/module/Grupos/Grupos";
import { Equipamiento } from "@/interfaces/module/Equipamiento/Equipamiento";
export default function EquipamientoModal({
  open,
  onClose,
  onSuccess,
  equipamientoEditando,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipamientoEditando?: Equipamiento | null;
}) {
  const [denominacion, setDenominacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [montoInvertido, setMontoInvertido] = useState<number | "">("");
  const [fechaIncorporacion, setFechaIncorporacion] = useState("");
  const [cantidad, setCantidad] = useState<number | "">("");
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoId, setGrupoId] = useState<number | "">("");
  const [mensaje, setMensaje] = useState<MensajeModal | null>(null);
  const [loading, setLoading] = useState(false);

  const { usuario } = useAuth();
  useEffect(() => {
    if (usuario?.rol !== "admin") return;
    async function cargarGrupos() {
      try {
        const data = await getGrupos();
        setGrupos(data);
      } catch (error) {
        console.error("Error al cargar grupos:", error);
      }
    }
    cargarGrupos();
  }, [usuario]);

  useEffect(() => {
    if (open) {
      if (equipamientoEditando) {
        // MODO EDICIÓN: Rellenar campos
        setDenominacion(equipamientoEditando.denominacion);
        setDescripcion(equipamientoEditando.descripcion);
        setMontoInvertido(equipamientoEditando.montoInvertido);
        setCantidad(equipamientoEditando.cantidad);
        if (equipamientoEditando.grupoId) {
          setGrupoId(equipamientoEditando.grupoId);
        }

        // Formatear fecha para el input type="date" (YYYY-MM-DD)
        if (equipamientoEditando.fechaIncorporacion) {
          const fechaObj = new Date(equipamientoEditando.fechaIncorporacion);
          // Truco simple para obtener YYYY-MM-DD sin problemas de zona horaria local al renderizar
          const fechaStr = fechaObj.toISOString().split("T")[0];
          setFechaIncorporacion(fechaStr);
        }
      } else {
        // MODO AGREGAR: Limpiar formulario
        resetForm();
      }
    }
  }, [equipamientoEditando, open]);

  if (!open) return null;
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (usuario?.rol === "admin" && !grupoId) {
      setMensaje({ tipo: "error", mensaje: "Debe seleccionar un grupo." });
      setLoading(false);
      return;
    }
    const payload = {
      denominacion,
      descripcion,
      montoInvertido:
        montoInvertido === "" ? undefined : Number(montoInvertido),
      fechaIncorporacion:
        fechaIncorporacion === "" ? undefined : fechaIncorporacion,
      cantidad: cantidad === "" ? undefined : cantidad,
      grupoId:
        usuario?.rol === "admin"
          ? grupoId === ""
            ? undefined
            : Number(grupoId)
          : usuario?.grupoId ?? undefined,
    };
    try {
      if (equipamientoEditando && equipamientoEditando.id) {
        {
          // MODO EDICIÓN
          // Aquí iría la lógica para actualizar el equipamiento
          await updateEquipamiento(equipamientoEditando.id, payload);
          setMensaje({
            tipo: "exito",
            mensaje: "Equipamiento actualizado con éxito.",
          });
        }
      } else {
        // MODO AGREGAR
        await createEquipamiento(payload);
        setMensaje({
          tipo: "exito",
          mensaje: "Equipamiento creado con éxito.",
        });
      }
      setTimeout(() => {
        resetForm();
        onSuccess();
        onClose();
        setLoading(false);
        setMensaje(null);
      }, 1000);
    } catch (error) {
      console.error("Error al crear el equipamiento:", error);
      setMensaje({ tipo: "error", mensaje: "Error al crear el equipamiento." });
      setLoading(false);
    }
  }
  function resetForm() {
    setDenominacion("");
    setFechaIncorporacion("");
    setMontoInvertido("");
    setDescripcion("");
    setCantidad("");
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              <div className="currency-input">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  min="0"
                  value={montoInvertido === "" ? "" : montoInvertido}
                  onChange={(e) =>
                    setMontoInvertido(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  required
                />
              </div>
            </div>
            <div className="form__row">
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
            </div>
            {usuario?.rol === "admin" && (
              <div className="form__group">
                <label>Grupo:</label>
                <select
                  value={grupoId}
                  onChange={(e) => setGrupoId(Number(e.target.value))}
                  required
                >
                  <option value="">Seleccionar grupo...</option>
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form__footer">
              <button
                type="submit"
                className={`form__submit-btn ${loading ? "btn--disabled" : ""}`}
                disabled={loading}
              >
                {loading ? <span className="btn-spinner"></span> : "Guardar"}
              </button>
            </div>
            {mensaje && (
              <ModalMensaje
                tipo={mensaje.tipo}
                mensaje={mensaje.mensaje}
                duracion={1000}
                onClose={() => {
                  setMensaje(null);
                  if (mensaje.tipo === "exito") {
                    resetForm();
                    onSuccess();
                    onClose();
                    setLoading(false);
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
