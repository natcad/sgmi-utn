"use client";
import { FaXmark } from "react-icons/fa6";
import ModalMensaje from "@/components/ModalMensaje";
import { useState, useEffect } from "react";
import useMiGrupo from "@/hooks/useMiGrupo";
import {
  createEquipamiento,
  updateEquipamiento,
} from "@/services/equipamiento.api";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import { useAuth } from "@/context/AuthContext";
import { getGrupos } from "@/services/grupos.api";
import { Grupo } from "@/interfaces/module/Grupos/Grupos";
import { Equipamiento } from "@/interfaces/module/Equipamiento/Equipamiento";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { equipamientoSchema } from "@/schemas/Equipamiento/equipamiento.schema";
import { EquipamientoFormData } from "@/schemas/Equipamiento/equipamiento.schema";

export default function EquipamientoModal({
  open,
  onClose,
  onSuccess,
  equipamientoEditando,
  grupoIdForzado,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipamientoEditando?: Equipamiento | null;
  grupoIdForzado?: number;
}) {
  const { usuario } = useAuth();
  const { miGrupo } = useMiGrupo();

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [mensaje, setMensaje] = useState<MensajeModal | null>(null);
  const [loading, setLoading] = useState(false);

  //inicializacion sin useState
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(equipamientoSchema),
    defaultValues: {
      denominacion: "",
      descripcion: "",
      montoInvertido: 0,
      fechaIncorporacion: "",
      cantidad: 0,
      grupoId: undefined,
    },
  });

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
    if (!open) return;
    if (equipamientoEditando) {
      // MODO EDICIÓN
      reset({
        denominacion: equipamientoEditando.denominacion,
        descripcion: equipamientoEditando.descripcion,
        montoInvertido: equipamientoEditando.montoInvertido,
        fechaIncorporacion:
          typeof equipamientoEditando.fechaIncorporacion === "string"
            ? equipamientoEditando.fechaIncorporacion
            : new Date(equipamientoEditando.fechaIncorporacion)
                .toISOString()
                .split("T")[0],
        cantidad: equipamientoEditando.cantidad,
        grupoId: equipamientoEditando.grupoId ?? undefined,
      });
    } else {
      // MODO AGREGAR
      reset({
        denominacion: "",
        descripcion: "",
        montoInvertido: 0,
        fechaIncorporacion: "",
        cantidad: 0,
        grupoId: grupoIdForzado ?? undefined,
      });
    }
  }, [equipamientoEditando, grupoIdForzado, open, reset]);

  async function onSubmit(data: EquipamientoFormData) {
    setLoading(true);
    try {
      // Si viene grupoId forzado (desde URL), siempre se prioriza.
      const finalGrupoId =
        grupoIdForzado ??
        (usuario?.rol === "admin" ? data.grupoId : miGrupo?.id ?? usuario?.grupoId);

      // Client-side validation: require grupoId
      if (!finalGrupoId) {
        setMensaje({
          tipo: "warning",
          mensaje:
            usuario?.rol === "admin"
              ? "Debe seleccionar un grupo para asociar el equipamiento."
              : "Tu usuario no está asociado a ningún grupo. Contactá al administrador.",
        });
        setLoading(false);
        return;
      }

      const payload = {
        ...data,
        montoInvertido: Number(data.montoInvertido),
        cantidad: Number(data.cantidad),
        grupoId: Number(finalGrupoId),
      };
      console.debug("Equipamiento payload:", payload);
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
        reset();
        onSuccess();
        onClose();
        setLoading(false);
        setMensaje(null);
      }, 1000);
    } catch (error: any) {
      // Log server response when available to help debugging
      console.error("Error al crear el equipamiento:", error);
      const serverMsg = error?.response?.data?.message || error?.response?.data?.error || null;
      setMensaje({
        tipo: "error",
        mensaje: serverMsg || "Error al crear el equipamiento.",
      });
      setLoading(false);
    }
  }
  if (!open) return null;

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
          <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
            <div className="form__group">
              <label>Denominación:</label>
              <input type="text" {...register("denominacion")} required />
              {errors.denominacion && (
                <p className="form__error">{errors.denominacion.message}</p>
              )}
            </div>
            <div className="form__group">
              <label>Descripción:</label>
              <textarea {...register("descripcion")} required />
              {errors.descripcion && (
                <p className="form__error">{errors.descripcion.message}</p>
              )}
            </div>
            <div className="form__group">
              <label>Monto Invertido:</label>
              <div className="currency-input">
                <span className="currency-symbol">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...register("montoInvertido", {
                    setValueAs: (v) => {
                      if (v === "" || v === undefined) return 0;
                      const valorNumerico = parseFloat(v);
                      return isNaN(valorNumerico) ? 0 : valorNumerico;
                    },
                  })}
                  onKeyDown={(e) => {
                    if (
                      [
                        "Backspace",
                        "Tab",
                        "Enter",
                        "Delete",
                        "ArrowLeft",
                        "ArrowRight",
                        "Home",
                        "End",
                      ].includes(e.key)
                    ) {
                      return;
                    }

                    if (
                      (e.ctrlKey || e.metaKey) &&
                      ["c", "v", "x", "a"].includes(e.key.toLowerCase())
                    ) {
                      return;
                    }

                    if (!/[0-9.]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
              {errors.montoInvertido && (
                <p className="form__error">{errors.montoInvertido.message}</p>
              )}
            </div>
            <div className="form__row">
              <div className="form__group">
                <label>Fecha de Incorporación:</label>
                <input type="date" {...register("fechaIncorporacion")} />
                {errors.fechaIncorporacion && (
                  <p className="form__error">
                    {errors.fechaIncorporacion.message}
                  </p>
                )}
              </div>
              <div className="form__group">
                <label>Cantidad:</label>
                <input
                  type="number"
                  {...register("cantidad", { valueAsNumber: true })}
                />
                {errors.cantidad && (
                  <p className="form__error">{errors.cantidad.message}</p>
                )}
              </div>
            </div>

            {usuario?.rol === "admin" && !grupoIdForzado && (
              <div className="form__group">
                <label>Grupo:</label>
                <select {...register("grupoId")}>
                  <option value="">Seleccionar grupo...</option>
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
                {errors.grupoId && (
                  <p className="form__error">{errors.grupoId.message}</p>
                )}
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
                    reset();
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
