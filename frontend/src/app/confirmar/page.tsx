"use client";
import { useEffect,JSX } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { AxiosError } from "axios";
export default function ConfirmarCuenta(): JSX.Element {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  useEffect(() => {
    const confirmar = async () => {
      try {
        if (!token) throw new Error("token no proporcionado");
        await api.get(`/auth/confirmar/${token}`);
        router.push("/login?status=success");
      } catch (err) {
        const axiosError = err as AxiosError<{
          error?: string;
          message?: string;
        }>;
        const mensajeError =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "El enlace de confirmación no es valido o ha expirado";

        router.push(
          `/login?status=error&msg=${encodeURIComponent(mensajeError)}`
        );
      }
    };
    confirmar();
  }, [token, router]);
  return (
  <div className="main-content confirmar" style={{ textAlign: "center", marginLeft: "0" }}>
    <h2>Confirmando tu cuenta...</h2>
    <p>Por favor espera un momento.</p>
  </div>
);
}
