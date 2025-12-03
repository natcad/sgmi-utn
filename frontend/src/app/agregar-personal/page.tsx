"use client";

import { useSearchParams } from "next/navigation";
import NuevoPersonalForm from "./components/NuevoPersonalForm";

export default function AddPersonal() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const grupoId = searchParams.get("grupoId");

  return (
    <NuevoPersonalForm
      modo={id ? "editar" : "crear"}
      idPersonal={id ? Number(id) : undefined}
      grupoId={grupoId ? Number(grupoId) : undefined}
    />
  );
}
