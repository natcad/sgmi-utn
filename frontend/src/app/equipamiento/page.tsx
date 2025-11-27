"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GruposEquipamientoPage() {
  const { usuario } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!usuario) return;

    if (usuario.rol !== "admin") {
      router.replace(`/equipamiento/${usuario.grupoId}`);
    } else {
      router.replace("/equipamiento/grupos");
    }
  }, [usuario, router]);

  return null; 
}
