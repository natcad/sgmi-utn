"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Table, ColumnDef } from "@tanstack/react-table";

import api from "@/services/api";
import { DataTable } from "@/components/DataTable";
import ModalMensaje from "@/components/ModalMensaje";
import ModalConfirmacion from "@/components/ModalConfirmacion";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import { useAuth } from "@/context/AuthContext";
import { FaCirclePlus } from "react-icons/fa6";
import AccionesColumna from "@/components/AccionesColumna";

export interface MemoriaResponse {
  id: number;
  anio: number;
  estado: "Borrador" | "Enviada" | "Aprobada" | "Rechazada";
  version: number;
  titulo: string | null;
  resumen?: string | null;
  grupoId: number;
  createdAt: string;
  grupo?: {
    id: number;
    nombre: string;
  };
}

export default function MemoriasPage() {
  const { usuario, cargandoUsuario } = useAuth();
  const router = useRouter();

  const [datos, setDatos] = useState<MemoriaResponse[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<Table<MemoriaResponse> | null>(null);
  const [modal, setModal] = useState<MensajeModal | null>(null);
  const [idEliminar, setIdEliminar] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const esAdmin =
    usuario?.rol &&
    ["admin", "administrador"].includes(usuario.rol.toLowerCase());

  const handleNuevaMemoria = () => {
    // Admin: elige grupo en /memorias/nueva
    // Integrante: /memorias/nueva resuelve el grupo con /grupos/mi-grupo
    router.push("/memorias/nueva");
  };

  useEffect(() => {
    if (cargandoUsuario || !usuario) return;

    async function fetchData() {
      try {
        let data: MemoriaResponse[] = [];

        if (esAdmin) {
          // ✅ CASO A: ADMIN → ve TODAS las memorias (de todos los grupos)
          const res = await api.get<MemoriaResponse[]>("/memorias", {
            params: { incluirDetalle: true },
          });
          data = res.data;
        } else {
          // ✅ CASO B: INTEGRANTE → SOLO memorias del grupo donde es integrante
          // El backend decide el grupo correcto vía /grupos/mi-grupo
          try {
            const resGrupo = await api.get("/grupos/mi-grupo");
            const miGrupoId = resGrupo.data.id;

            const resMemorias = await api.get<MemoriaResponse[]>("/memorias", {
              params: { grupoId: miGrupoId, incluirDetalle: false },
            });

            data = resMemorias.data;
          } catch (error) {
            console.log(
              "El usuario no tiene grupo asignado o hubo un error al obtener su grupo."
            );
            console.error(error);
            data = [];
          }
        }

        setDatos(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) return;
        console.error("Error al cargar memorias:", error);
      }
    }

    fetchData();
  }, [usuario, cargandoUsuario, esAdmin]);

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

  const columns: ColumnDef<MemoriaResponse>[] = useMemo(() => {
    const baseCols: ColumnDef<MemoriaResponse>[] = [
      {
        accessorKey: "anio",
        header: "Año",
        cell: (info) => info.getValue<number>(),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: (info) => info.getValue<string>(),
      },
      {
        accessorKey: "version",
        header: "Versión",
        cell: (info) => info.getValue<number>(),
      },
      {
        accessorKey: "titulo",
        header: "Título",
        cell: (info) => info.getValue<string | null>() || "Sin título",
      },
      {
        accessorKey: "createdAt",
        header: "Creada el",
        cell: (info) => {
          const value = info.getValue<string | null>();
          if (!value) return "-";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return value;
          return date.toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
    ];

    // 👇 Solo el ADMIN ve la columna "Grupo"
    if (esAdmin) {
      baseCols.splice(1, 0, {
        accessorKey: "grupo",
        header: "Grupo",
        cell: ({ row }) =>
          row.original.grupo?.nombre ?? `Grupo #${row.original.grupoId}`,
      });
    }

    baseCols.push({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <AccionesColumna
          id={row.original.id}
          path="memorias"
          showEdit={false}
          onDelete={() => solicitarEliminacion(row.original.id)}
        />
      ),
    });

    return baseCols;
  }, [esAdmin]);

  const hayDatos = datos.length > 0;

  return (
    <div className="memorias">
      <h1 className="memorias__titulo">Administración de Memorias</h1>

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
                  if (
                    globalFilter.trim() !== "" &&
                    filasFiltradas.length === 0
                  ) {
                    setModal({
                      tipo: "warning",
                      mensaje:
                        "Memoria no encontrada.<br/>Intente con otro término de búsqueda.",
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
            <DataTable<MemoriaResponse>
              data={datos}
              columns={columns}
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
              pageSize={6}
              sortBy={[
                { id: "anio", desc: true },
                { id: "version", desc: true },
              ]}
            />
          </div>
        </>
      ) : (
        <div className="memorias__empty">
          <p className="memorias__empty-text">
            No hay memorias cargadas todavía.
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
          mensaje="¿Estás segura de que querés eliminar esta memoria? Esta acción no se puede deshacer."
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
