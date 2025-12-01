"use client";
import { useState, useEffect, useMemo } from "react";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";
import { DataTable } from "@/components/DataTable";
import api from "@/services/api";
import { columnasPersonal } from "./columnasPersonal"; 
import { Table } from "@tanstack/react-table";
import { FaCirclePlus } from "react-icons/fa6";
import ModalMensaje from "@/components/ModalMensaje";
import ModalConfirmacion from "@/components/ModalConfirmacion"; 
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import axios from "axios";
import Link from "next/link";

export default function Personal() {
  const [datos, setDatos] = useState<PersonalResponse[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [table, setTable] = useState<Table<PersonalResponse> | null>(null);
  const [modal, setModal] = useState<MensajeModal | null>(null);
  
  const [idEliminar, setIdEliminar] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get<PersonalResponse[]>("/personal");
        setDatos(res.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) return;
        console.error("Error al cargar personal:", error);
      }
    }
    fetchData();
  }, []);


  const solicitarEliminacion = (id: number) => {
    setIdEliminar(id);
  };

  const confirmarEliminacion = async () => {
    if (!idEliminar) return;

    try {
      await api.delete(`/personal/${idEliminar}`);
      
      setDatos((prev) => prev.filter((item) => item.id !== idEliminar));
      
      setModal({
        tipo: "exito",
        mensaje: "Personal eliminado correctamente",
      });
    } catch (error) {
      console.error(error);
      setModal({
        tipo: "error",
        mensaje: "Hubo un error al eliminar el personal",
      });
    } finally {
      setIdEliminar(null);
    }
  };


  const columns = useMemo(() => {
    return columnasPersonal(solicitarEliminacion);
  }, []);

  return (
    <div className="personal">
      <h1 className="personal__titulo">Administración de Personal</h1>

      <div className="personal__toolbar">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar..."
          className="personal__input"
          onKeyDown={(e) => {
            if (e.key === "Enter" && table) {
              const filasFiltradas = table.getRowModel().rows;
              if (globalFilter.trim() !== "" && filasFiltradas.length === 0) {
                setModal({
                  tipo: "warning",
                  mensaje: "Personal No Encontrado <br/> Ingrese Nuevamente",
                });
              }
            }
          }}
        />

        <Link className="personal__add-btn" href="/agregar-personal">
          <FaCirclePlus /> Agregar Personal
        </Link>
      </div>

      <div className="personal__table-wrapper">
        <DataTable<PersonalResponse>
          data={datos}
          columns={columns}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          pageSize={6}
        />

        
      </div>

      {/* --- MODAL DE CONFIRMACIÓN (Interactivo) --- */}
      {idEliminar && (
        <ModalConfirmacion
          mensaje="¿Estás seguro de que deseas <b>eliminar</b> a este personal?<br>Esta acción no se puede deshacer."
          onConfirm={confirmarEliminacion}
          onCancel={() => setIdEliminar(null)}
        />
      )}

      {/* --- MODAL DE MENSAJE (Notificación) --- */}
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