// app/grupos/[id]/editar/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import NuevoGrupoForm from "../../components/NuevoGrupoForm";
import { getGrupo, getGrupoDetalle } from "@/services/grupos.api";
import { GrupoFormValues } from "@/schemas/Grupo/grupo.schema";
import { PersonalResponse } from "@/interfaces/module/Personal/Personal";
import { GrupoDetalle } from "@/interfaces/module/Grupos/GrupoDetalle";
import { Grupo } from "@/interfaces/module/Grupos/Grupos";

const limpiarComillas = (v?: string | null) =>
  v ? v.replace(/^"+|"+$/g, "") : v ?? "";
type GrupoConIntegrantes = GrupoDetalle;
export default function EditarGrupoPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const idParam = params?.id as string | undefined;
  const idGrupo = idParam ? Number(idParam) : NaN;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [valoresIniciales, setValoresIniciales] =
    useState<Partial<GrupoFormValues> | null>(null);
  const [integrantesGrupo, setIntegrantesGrupo] = useState<PersonalResponse[]>(
    []
  );

  const startOnPaso2 = searchParams.get("paso") === "2";

  useEffect(() => {
    if (!idParam || Number.isNaN(idGrupo)) {
      setError("ID de grupo inválido.");
      setLoading(false);
      return;
    }

    const cargarGrupo = async () => {
      try {
        setLoading(true);

        const grupo = (await getGrupoDetalle(idGrupo)) as GrupoConIntegrantes;

        const initial: Partial<GrupoFormValues> = {
          facultadRegional: grupo.idFacultadRegional
            ? String(grupo.idFacultadRegional)
            : "",
          nombre: limpiarComillas(grupo.nombre),
          correo: limpiarComillas(grupo.correo),
          siglas: limpiarComillas(grupo.siglas),

          objetivo: grupo.objetivo ?? "",
          director:
            grupo.idDirector != null ? String(grupo.idDirector) : undefined,
          vicedirector:
            grupo.idVicedirector != null
              ? String(grupo.idVicedirector)
              : undefined,
          integrantesCE: [],
        };

        setValoresIniciales(initial);
        setIntegrantesGrupo(grupo.integrantes || []);
      } catch (e) {
        console.error("Error al cargar grupo para editar:", e);
        setError("No se pudo cargar el grupo para editar.");
      } finally {
        setLoading(false);
      }
    };

    cargarGrupo();
  }, [idParam, idGrupo]);

  if (loading) return <p>Cargando grupo...</p>;
  if (error) return <p>{error}</p>;
  if (!valoresIniciales) return <p>No se encontraron datos del grupo.</p>;

  return (
    <NuevoGrupoForm
      modo="editar"
      idGrupo={idGrupo}
      valoresIniciales={valoresIniciales}
      integrantesGrupo={integrantesGrupo}
      startOnPaso2={startOnPaso2}
    />
  );
}
