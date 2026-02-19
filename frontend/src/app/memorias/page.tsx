"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@tanstack/react-table";

import api from "@/services/api";
import ModalMensaje from "@/components/ModalMensaje";
import ModalConfirmacion from "@/components/ModalConfirmacion";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import { useAuth } from "@/context/AuthContext";
import { FaCirclePlus } from "react-icons/fa6";
import MemoriasTable from "@/components/memorias/MemoriasTable";
import { useMemoriasList } from "@/hooks/useMemoriasList";
import { MemoriaResumen } from "@/interfaces/module/Memorias/MemoriaResumen";

export default function MemoriasPage() {
  const { usuario, cargandoUsuario } = useAuth();
  const router = useRouter();

  const [datos, setDatos] = useState<MemoriaResumen[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<Table<MemoriaResumen> | null>(null);
  const [modal, setModal] = useState<MensajeModal | null>(null);
  const [idEliminar, setIdEliminar] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const esAdmin =
    usuario?.rol &&
    ["admin", "administrador"].includes(usuario.rol.toLowerCase());

  const { datos: datosMemorias } = useMemoriasList({
    esAdmin,
    usuario,
    cargandoUsuario,
  });

  useEffect(() => {
    setDatos(datosMemorias);
  }, [datosMemorias]);

  const handleNuevaMemoria = () => {
    router.push("/memorias/crear-memoria");
  };

  const solicitarEliminacion = (id: number) => {
    setIdEliminar(id);
    setShowConfirm(true);
  };

  const confirmarEliminacion = async () => {
    if (!idEliminar) return;

    try {
      await api.delete(`/memorias/${idEliminar}`);

      setDatos((prev) => prev.filter((item) => item.id !== idEliminar));

      setModal({
        tipo: "exito",
        mensaje: "Memoria eliminada correctamente",
      });
    } catch (error) {
      console.error(error);
      setModal({
        tipo: "error",
        mensaje: "Hubo un error al eliminar la memoria",
      });
    } finally {
      setIdEliminar(null);
      setShowConfirm(false);
    }
  };

  const hayDatos = datos.length > 0;

  return (
    <div className="memorias">
      <h1 className="memorias__titulo">Administracion de Memorias</h1>

      {hayDatos ? (
        <>
          <div className="memorias__toolbar">
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar..."
              className="memorias__input"
              onKeyDown={(e) => {
                if (e.key === "Enter" && table) {
                  const filasFiltradas = table.getRowModel().rows;
                  if (globalFilter.trim() !== "" && filasFiltradas.length === 0) {
                    setModal({
                      tipo: "warning",
                      mensaje:
                        "Memoria no encontrada.<br/>Intente con otro termino de busqueda.",
                    });
                  }
                }
              }}
            />

            {usuario && (
              <button
                type="button"
                className="memorias__add-btn"
                onClick={handleNuevaMemoria}
              >
                <FaCirclePlus /> Nueva Memoria
              </button>
            )}
          </div>

          <div className="memorias__table-wrapper">
            <MemoriasTable
              data={datos}
              esAdmin={esAdmin}
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
              onTableInit={setTable}
              onDelete={solicitarEliminacion}
            />
          </div>
        </>
      ) : (
        <div className="memorias__empty">
          <p className="memorias__empty-text">
            No hay memorias cargadas todavia.
            {usuario && (
              <>
                <br />
                <button
                  type="button"
                  className="memorias__add-btn memorias__add-btn--inline"
                  onClick={handleNuevaMemoria}
                >
                  <FaCirclePlus /> Crear Memoria
                </button>
              </>
            )}
          </p>
        </div>
      )}

      {showConfirm && idEliminar !== null && (
        <ModalConfirmacion
          mensaje="Estas segura de que queres eliminar esta memoria? <br/> Esta accion no se puede deshacer."
          onConfirm={confirmarEliminacion}
          onCancel={() => {
            setIdEliminar(null);
            setShowConfirm(false);
          }}
        />
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
