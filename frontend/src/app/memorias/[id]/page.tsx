// src/app/memorias/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ColumnDef } from "@tanstack/react-table";

import api from "@/services/api";
import ModalMensaje from "@/components/ModalMensaje";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";
import { DataTable } from "@/components/DataTable";

interface GrupoResumen {
  id: number;
  nombre: string;
}

interface CreadorResumen {
  id: number;
  nombre: string;
  apellido: string;
  email?: string;
}

interface UsuarioEmbedded {
  id: number;
  nombre: string;
  apellido: string;
  email?: string;
}

interface PersonalEmbedded {
  id: number;
  Usuario?: UsuarioEmbedded; 
}

interface MemoriaPersonalItem {
  id: number;
  idMemoria: number;
  idPersonal: number;
  ObjectType: string | null;
  horasSemanales: number | null;
  rol: string | null;
  nivelDeFormacion: string | null;
  categoriaUTN: string | null;
  dedicacion: string | null;
  tipoFormacion: string | null;
  observaciones?: string | null;
  personal?: PersonalEmbedded;
}


// Snapshot de equipamiento de la memoria
interface MemoriaEquipamientoItem {
  id: number;
  idMemoria: number;
  idEquipamiento: number;
  denominacion: string;
  descripcion: string | null;
  montoInvertido: string;      // DECIMAL → string
  fechaIncorporacion: string;  // YYYY-MM-DD
  cantidad: number;
}

interface MemoriaDetalleResponse {
  id: number;
  anio: number;
  estado: "Borrador" | "Enviada" | "Aprobada" | "Rechazada"; 
  version: number;
  titulo: string | null;
  resumen: string | null;
  grupoId: number;
  grupo?: GrupoResumen;
  creador?: CreadorResumen;
  personal?: MemoriaPersonalItem[];
  equipamiento?: MemoriaEquipamientoItem[];
}

export default function MemoriaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };

  const [memoria, setMemoria] = useState<MemoriaDetalleResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState<MensajeModal | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchMemoria = async () => {
      try {
        const res = await api.get<MemoriaDetalleResponse>(`/memorias/${id}`, {
          params: { incluirDetalle: true },
        });
        setMemoria(res.data);
      } catch (error) {
        console.error("Error al obtener la memoria:", error);
        let mensaje =
          "Ocurrió un error al cargar la memoria. Por favor, intente nuevamente.";
        if (axios.isAxiosError(error) && error.response?.data?.message) {
          mensaje = error.response.data.message;
        }
        setModal({ tipo: "error", mensaje });
      } finally {
        setCargando(false);
      }
    };

    fetchMemoria();
  }, [id]);
const columnasPersonal: ColumnDef<MemoriaPersonalItem>[] = useMemo(
  () => [
    {
      accessorKey: "personal",
      header: "Integrante",
      cell: ({ row }) => {
        const p = row.original.personal;
        const u = p?.Usuario;
        if (!p || !u) return `#${row.original.idPersonal}`;
        return `${u.apellido} ${u.nombre}`;
      },
    },
    {
      accessorKey: "rol",
      header: "Rol",
      cell: (info) => info.getValue<string | null>() ?? "-",
    },
    {
      accessorKey: "horasSemanales",
      header: "Horas/sem",
      cell: (info) =>
        info.getValue<number | null>() ?? "-",
    },
    {
      accessorKey: "categoriaUTN",
      header: "Cat. UTN",
      cell: (info) => info.getValue<string | null>() ?? "-",
    },
    {
      accessorKey: "dedicacion",
      header: "Dedicación",
      cell: (info) => info.getValue<string | null>() ?? "-",
    },
    {
      accessorKey: "tipoFormacion",
      header: "Formación",
      cell: (info) => info.getValue<string | null>() ?? "-",
    },
  ],
  []
);


  const columnasEquipamiento: ColumnDef<MemoriaEquipamientoItem>[] = useMemo(
    () => [
      {
        accessorKey: "denominacion",
        header: "Denominación",
        cell: (info) => info.getValue<string>(),
      },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        cell: (info) => info.getValue<string | null>() ?? "-",
      },
      {
        accessorKey: "cantidad",
        header: "Cantidad",
        cell: (info) => info.getValue<number>(),
      },
      {
        accessorKey: "montoInvertido",
        header: "Monto invertido",
        cell: (info) => `$ ${info.getValue<string>()}`,
      },
      {
        accessorKey: "fechaIncorporacion",
        header: "Fecha incorporación",
        cell: (info) => info.getValue<string>(),
      },
    ],
    []
  );

  const handleVolver = () => {
    router.push("/memorias");
  };

  if (cargando) {
    return (
      <div className="memoria-detalle">
        <p className="memoria-detalle__loading">Cargando memoria...</p>
      </div>
    );
  }

  if (!memoria) {
    return (
      <div className="memoria-detalle">
        <p className="memoria-detalle__loading">
          No se encontró la memoria solicitada.
        </p>
      </div>
    );
  }
   console.log(memoria);

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
              <span className="memoria-detalle__meta-label">Creada por: </span>
              <span className="memoria-detalle__meta-value">
                {memoria.creador.nombre} {memoria.creador.apellido}
              </span>
            </div>
          )}
        </div>

        {memoria.resumen && (
          <div className="memoria-detalle__resumen">
            <h2>Resumen</h2>
            <p>{memoria.resumen}</p>
          </div>
        )}
      </div>

      <div className="memoria-detalle__section">
        <h2 className="memoria-detalle__section-title">
          Personal en la memoria
        </h2>
        {memoria.personal && memoria.personal.length > 0 ? (
          <div className="memoria-detalle__table-wrapper">
            <DataTable<MemoriaPersonalItem>
              data={memoria.personal}
              columns={columnasPersonal}
             sortBy={[{ id: "personal", desc: false }]}
              pageSize={6}
            />
          </div>
        ) : (
          <p className="memoria-detalle__empty">
            Esta memoria no tiene registros de personal.
          </p>
        )}
      </div>

      <div className="memoria-detalle__section">
        <h2 className="memoria-detalle__section-title">
          Equipamiento en la memoria
        </h2>
        {memoria.equipamiento && memoria.equipamiento.length > 0 ? (
          <div className="memoria-detalle__table-wrapper">
            <DataTable<MemoriaEquipamientoItem>
              data={memoria.equipamiento}
              columns={columnasEquipamiento}
              pageSize={6}
            sortBy={[{ id: "fechaIncorporacion", desc: true }]}

            />
          </div>
        ) : (
          <p className="memoria-detalle__empty">
            Esta memoria no tiene registros de equipamiento.
          </p>
        )}
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
