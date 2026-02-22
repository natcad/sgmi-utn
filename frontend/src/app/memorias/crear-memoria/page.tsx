"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import ModalMensaje from "@/components/ModalMensaje";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";

interface GrupoOption {
  id: number;
  nombre: string;
}

export default function NuevaMemoriaPage() {
  const { usuario, cargandoUsuario } = useAuth();
  const router = useRouter();

  const [grupos, setGrupos] = useState<GrupoOption[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<number | "">("");
  const [anio, setAnio] = useState<number | "">(
    new Date().getFullYear()
  );
  const [titulo, setTitulo] = useState("");
  const [resumen, setResumen] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [modal, setModal] = useState<MensajeModal | null>(null);

  const esAdmin =
    usuario?.rol &&
    ["admin", "administrador"].includes(usuario.rol.toLowerCase());

  // Cargar grupos o el grupo del integrante
  useEffect(() => {
    if (cargandoUsuario || !usuario) return;

    const cargarDatos = async () => {
      try {
        if (esAdmin) {
          // Admin: lista de grupos para elegir
          const res = await api.get<GrupoOption[]>("/grupos");
          setGrupos(res.data);
        } else {
          // Integrante: se trae su grupo y fija el select
          const resGrupo = await api.get("/grupos/mi-grupo");
          const miGrupo: GrupoOption = {
            id: resGrupo.data.id,
            nombre: resGrupo.data.nombre,
          };
          setGrupos([miGrupo]);
          setGrupoSeleccionado(miGrupo.id);
        }
      } catch (error) {
        console.error("Error al cargar grupos para nueva memoria:", error);
        setModal({
          tipo: "error",
          mensaje:
            "Ocurrió un error al cargar los datos del grupo. Intenta nuevamente más tarde.",
        });
      }
    };

    cargarDatos();
  }, [usuario, cargandoUsuario, esAdmin]);

  const validarFormulario = () => {
    if (!grupoSeleccionado) {
      setModal({
        tipo: "warning",
        mensaje: "Debe seleccionar un grupo para la memoria.",
      });
      return false;
    }

    if (!anio || Number.isNaN(Number(anio))) {
      setModal({
        tipo: "warning",
        mensaje: "Debe indicar un año válido para la memoria.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (!validarFormulario()) return;

  try {
    setEnviando(true);

    await api.post("/memorias", {
      grupoId: grupoSeleccionado,
      anio: Number(anio),
      titulo: titulo.trim() || null,
      resumen: resumen.trim() || null,
      idCreador: usuario?.id,    
    });

    setModal({
      tipo: "exito",
      mensaje: "Memoria creada correctamente.",
    });

    setTimeout(() => {
      router.push("/memorias");
    }, 1000);
  } catch (error) {
    console.error("Error al crear memoria:", error);
    let mensaje =
      "Ocurrió un error al crear la memoria. Por favor, intente nuevamente.";
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      mensaje = error.response.data.message;
    }

    setModal({
      tipo: "error",
      mensaje,
    });
  } finally {
    setEnviando(false);
  }
};


  const grupoActual =
    !esAdmin && grupos.length === 1 ? grupos[0] : null;

  return (
    <div className="page-bg">
      <div className="memoria-form">
        <h1 className="memoria-form__titulo">Nueva Memoria Anual</h1>

        <form className="memoria-form__card" onSubmit={handleSubmit}>
          <h2 className="memoria-form__subtitulo">Datos Básicos</h2>

          {/* Grupo */}
          <div className="memoria-form__grupo">
            <div className="memoria-form__field">
              <label className="memoria-form__label">
                Grupo <span className="memoria-form__asterisco">*</span>
              </label>

              {esAdmin ? (
                <select
                  className="memoria-form__input"
                  value={grupoSeleccionado}
                  onChange={(e) =>
                    setGrupoSeleccionado(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                >
                  <option value="">Seleccione un grupo</option>
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="memoria-form__input memoria-form__input--readonly"
                  value={grupoActual?.nombre || "Sin grupo asignado"}
                  readOnly
                />
              )}
            </div>
          </div>

          {/* Año + Título */}
          <div className="memoria-form__row">
            <div className="memoria-form__field">
              <label className="memoria-form__label">
                Año <span className="memoria-form__asterisco">*</span>
              </label>
              <input
                type="number"
                className="memoria-form__input"
                min={1900}
                max={2100}
                value={anio}
                onChange={(e) =>
                  setAnio(e.target.value ? Number(e.target.value) : "")
                }
              />
            </div>

            <div className="memoria-form__field memoria-form__field--grow">
              <label className="memoria-form__label">Título</label>
              <input
                type="text"
                className="memoria-form__input"
                placeholder="Opcional: título de la memoria"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={150}
              />
            </div>
          </div>

          {/* Resumen */}
          <div className="memoria-form__field">
            <label className="memoria-form__label">Resumen</label>
            <textarea
              className="memoria-form__textarea"
              rows={4}
              placeholder="Breve resumen de la memoria (opcional)"
              value={resumen}
              onChange={(e) => setResumen(e.target.value)}
              maxLength={500}
            />
            <div className="memoria-form__char-counter">
              {resumen.length}/500
            </div>
          </div>

          {/* Footer */}
          <div className="memoria-form__footer">
            <button
              type="button"
              className="memoria-form__btn memoria-form__btn--secondary"
              onClick={() => router.push("/memorias")}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="memoria-form__btn memoria-form__btn--primary"
              disabled={enviando}
            >
              {enviando ? "Creando..." : "Crear Memoria"}
            </button>
          </div>
        </form>
      </div>

      {modal && (
        <ModalMensaje
          tipo={modal.tipo}
          mensaje={modal.mensaje}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
