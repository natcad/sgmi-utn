// src/app/memorias/[id]/page.tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import ModalMensaje from "@/components/ModalMensaje";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import MemoriaDetalleTables from "@/components/memorias/MemoriaDetalleTables";
import { useMemoriaDetalle } from "@/hooks/useMemoriaDetalle";
import { useEffect, useRef, useState } from "react";
import { FaEllipsisVertical } from "react-icons/fa6";
import api from "@/services/api";
import ModalConfirmacion from "@/components/ModalConfirmacion";

export default function MemoriaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };

  const { memoria, cargando, modal, setModal } = useMemoriaDetalle(id);
  console.log("memoria:", memoria);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailsInput, setEmailsInput] = useState("");
  const [enviandoMail, setEnviandoMail] = useState(false);
  // --- Menu (⋮) ---
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuAbierto((prev) => !prev);
  };

  const cerrarMenu = () => setMenuAbierto(false);

  // Cerrar menú con click afuera / Escape
  useEffect(() => {
    if (!menuAbierto) return;

    const onClickOutside = (ev: MouseEvent) => {
      const target = ev.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuAbierto(false);
      }
    };

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setMenuAbierto(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuAbierto]);
  // --- Editar memoria ---
  const handleEditarMemoria = () => {
    if (!memoria?.id) return;
    cerrarMenu();
    router.push(`/memorias/crear-memoria?id=${memoria.id}`);
  };

  // --- Eliminar memoria  ---
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEliminarMemoriaClick = () => {
    if (memoria?.estado !== "Borrador") return;
    cerrarMenu();
    setShowConfirm(true);
  };

  const confirmarEliminacion = async () => {
    if (!memoria?.id) return;

    try {
      await api.delete(`/memorias/${memoria.id}`);

      setModal({
        tipo: "exito",
        mensaje: "Memoria eliminada correctamente",
      });

      setShowConfirm(false);
      router.push("/memorias");
    } catch (error) {
      console.error(error);
      setModal({
        tipo: "error",
        mensaje: "Hubo un error al eliminar la memoria",
      });
      setShowConfirm(false);
    }
  };

  const cancelarEliminacion = () => setShowConfirm(false);

  const handleVolver = () => {
    router.push("/memorias");
  };
  const parseEmails = (input: string) =>
    input
      .split(/[\s,;]+/)
      .map((email) => email.trim())
      .filter(Boolean);

  const getFilenameFromHeader = (disposition?: string) => {
    if (!disposition) return null;
    const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    return decodeURIComponent(match?.[1] || match?.[2] || "").trim() || null;
  };

  const handleEnviar = () => {
    if (!memoria?.id) return;
    setShowEmailModal(true);
  };

  const confirmarEnvioPorMail = async () => {
    if (!memoria?.id) return;

    const emails = parseEmails(emailsInput);
    if (!emails.length) {
      setModal({
        tipo: "warning",
        mensaje: "Debe indicar al menos un email válido.",
      });
      return;
    }

    try {
      setEnviandoMail(true);
      const res = await api.post(`/memorias/${memoria.id}/enviar-por-mail`, {
        emails,
      });

      setModal({
        tipo: res.data?.emailEnviado === false ? "warning" : "exito",
        mensaje:
          res.data?.message || "Memoria enviada por mail correctamente.",
      });
      setShowEmailModal(false);
      setEmailsInput("");
    } catch (error) {
      console.error(error);
      setModal({
        tipo: "error",
        mensaje: "Hubo un error al enviar la memoria por mail.",
      });
    } finally {
      setEnviandoMail(false);
    }
  };

  const handleDescargar = async () => {
    if (!memoria?.id) return;

    try {
      const res = await api.get(`/memorias/${memoria.id}/exportar/excel`, {
        responseType: "blob",
      });

      const filename =
        getFilenameFromHeader(res.headers["content-disposition"]) ||
        `Memoria_${memoria.anio ?? memoria.id}.xlsx`;
      const blob = new Blob([res.data], {
        type:
          res.headers["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setModal({
        tipo: "error",
        mensaje: "Hubo un error al descargar la memoria.",
      });
    }
  };

  const onClick = () => {
    if (memoria?.estado === "Borrador" || memoria?.estado === "Rechazada") {
      return handleEnviar();
    } else {
      return handleDescargar();
    }
  };
  if (cargando) {
    return (
      <div className="memoria-detalle">
        <Loading message="Cargando memoria..." />
      </div>
    );
  }

  if (!memoria) {
    return (
      <div className="memoria-detalle">
        <EmptyState title="No se encontró la memoria solicitada." />
      </div>
    );
  }

  return (
    <div className="memoria-detalle">
      <div className="memoria-detalle__header">
        <button
          type="button"
          className="memoria-detalle__back-btn"
          onClick={handleVolver}
        >
          ← Volver a Memorias
        </button>

        <h1 className="memoria-detalle__titulo">
          {memoria.titulo || `Memoria ${memoria.anio}`}
        </h1>

        <div className="memoria-detalle__meta">
          <div>
            <div>
              <span className="memoria-detalle__meta-label">Grupo: </span>
              <span className="memoria-detalle__meta-value">
                {memoria.grupo?.nombre ?? `#${memoria.grupoId}`}
              </span>
            </div>
            <div>
              <span className="memoria-detalle__meta-label">Año: </span>
              <span className="memoria-detalle__meta-value">
                {memoria.anio}
              </span>
            </div>
            <div>
              <span className="memoria-detalle__meta-label">Estado: </span>
              <span
                className={`memoria-detalle__estado memoria-detalle__estado--${memoria.estado.toLowerCase()}`}
              >
                {memoria.estado}
              </span>
            </div>
            <div>
              <span className="memoria-detalle__meta-label">Versión: </span>
              <span className="memoria-detalle__meta-value">
                {memoria.version}
              </span>
            </div>
            {memoria.creador && (
              <div>
                <span className="memoria-detalle__meta-label">
                  Creada por:{" "}
                </span>
                <span className="memoria-detalle__meta-value">
                  {memoria.creador.nombre} {memoria.creador.apellido}
                </span>
              </div>
            )}
            <div />
          </div>
          <div className="memoria-detalle__meta-action">
            <button className="memoria-detalle__meta-btn" onClick={onClick}>
              {memoria.estado === "Borrador"
                ? "Enviar"
                : memoria.estado === "Rechazada"
                  ? "Reenviar"
                  : "Descargar"}
            </button>
            {memoria.estado === "Borrador" && (
              <div ref={menuRef} className="memoria-detalle__menu-wrapper">
                <button
                  className="memoria-detalle__menu-trigger"
                  onClick={toggleMenu}
                  type="button"
                  aria-label="Más acciones"
                >
                  <FaEllipsisVertical />
                </button>

                {menuAbierto && (
                  <div className="memoria-detalle__menu">
                    <button
                      className="memoria-detalle__menu-item"
                      onClick={handleEditarMemoria}
                      type="button"
                    >
                      Editar memoria
                    </button>
                    <button
                      className="memoria-detalle__menu-item memoria-detalle__menu-item--danger"
                      onClick={handleEliminarMemoriaClick}
                      type="button"
                    >
                      Eliminar memoria
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {memoria.resumen && (
          <div className="memoria-detalle__resumen">
            <h2>Resumen</h2>
            <p>{memoria.resumen}</p>
          </div>
        )}
      </div>

      <MemoriaDetalleTables
        personal={memoria.personal}
        equipamiento={memoria.equipamiento}
      />
      {showConfirm && memoria.estado === "Borrador" && (
        <ModalConfirmacion
          mensaje="Estas segura de que queres eliminar esta memoria? <br/> Esta accion no se puede deshacer."
          onConfirm={confirmarEliminacion}
          onCancel={cancelarEliminacion}
        />
      )}
      {showEmailModal && (
        <div
          className="memoria-detalle__modal-overlay"
          onClick={() => setShowEmailModal(false)}
          role="presentation"
        >
          <div
            className="memoria-detalle__modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="memoria-detalle__modal-title">
              Enviar memoria por mail
            </h3>
            <p className="memoria-detalle__modal-subtitle">
              Ingresá uno o más correos separados por coma.
            </p>
            <textarea
              className="memoria-detalle__modal-textarea"
              rows={3}
              placeholder="ejemplo@correo.com, otro@correo.com"
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
            />
            <div className="memoria-detalle__modal-actions">
              <button
                type="button"
                className="memoria-detalle__modal-btn memoria-detalle__modal-btn--secondary"
                onClick={() => setShowEmailModal(false)}
                disabled={enviandoMail}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="memoria-detalle__modal-btn"
                onClick={confirmarEnvioPorMail}
                disabled={enviandoMail}
              >
                {enviandoMail ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
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
