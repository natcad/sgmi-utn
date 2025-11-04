"use client";

import { JSX, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { AxiosError } from "axios";
import { FaCircleUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa6";
import ModalMensaje from "@/components/ModalMensaje";
interface Modal {
  tipo: "exito" | "error" | "warning";
  mensaje: string;
}

export default function ResetPassword(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [modal, setModal] = useState<Modal | null>(null);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorComparacion, setErrorComparacion] = useState("");
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setErrorComparacion("");
    if (password !== confirmPassword) {
      setErrorComparacion("Las contraseñas no coinciden.");
      return;
    }
    try {
      const respuesta = await api.post("/auth/reset-password", {
        token,
        password,
      });
      if (respuesta.status === 200) {
        setModal({
          tipo: "exito",
          mensaje: "¡Tu contraseña se restablecio correctamente!",
        });
        setTimeout(() => router.push("/login"), 2500);
      }
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        error?: string;
      }>;
      const mensajeError =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Error al restablecer la contraseña";
      setError(mensajeError);
      setModal({ tipo: "error", mensaje: mensajeError });
    }
  };

  return (
    <div className="login">
      {modal && (
        <ModalMensaje
          tipo={modal.tipo}
          mensaje={modal.mensaje}
          onClose={() => setModal(null)}
        />
      )}

      <div className="login__card">
        <FaCircleUser className="login__icon" />
        <h2 className="login__title">Restablecer Contraseña</h2>
        <p className="reset-text">
          Ingresa tu nueva contraseña para continuar con tu cuenta
        </p>
        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label className="login__label">Nueva Contraseña:</label>
            <div className="login__group">
              <FaLock className="login__group--icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(p) => setPassword(p.target.value)}
                required
                className="login__input"
              />
              <button
                type="button"
                className="login__toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="login__field">
            <label className="login__label">Confirmar Contraseña:</label>
            <div className="login__group">
              <FaLock className="login__group--icon" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(p) => setConfirmPassword(p.target.value)}
                required
                className="login__input"
              />
              <button
                type="button"
                className="login__toggle"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          {errorComparacion && <p className="login__error">{errorComparacion}</p>}
          <button type="submit" className="login__button">
            Restablecer Contraseña
          </button>
          <p className="login__text">
            Si no tienes una cuenta,{" "}
            <a href="#" className="login__link">
              Resgistrarse{" "}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
