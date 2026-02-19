"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useMiGrupo from "@/hooks/useMiGrupo";

export default function GruposEquipamientoPage() {
  const { usuario, cargandoUsuario } = useAuth();
  const router = useRouter();
  const { miGrupo, loading: loadingMiGrupo } = useMiGrupo();

  useEffect(() => {
    if (cargandoUsuario || loadingMiGrupo) return;
    if (!usuario) return;

    if (usuario.rol === "admin") {
      router.replace("/equipamiento/grupos");
      return;
    }

    // Integrante: preferir el grupo ya resuelto por el hook
    if (miGrupo && miGrupo.id) {
      router.replace(`/equipamiento/${miGrupo.id}`);
    } else {
      // Si no tiene grupo, redirigir a la vista genérica de equipamiento
      router.replace(`/equipamiento`);
    }
  }, [usuario, cargandoUsuario, miGrupo, loadingMiGrupo, router]);

  return null;
}
