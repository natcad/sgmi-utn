"use client";

import { FormEvent, JSX, useState } from "react";
import api from "@/services/api";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { FaCircleUser, FaEnvelope } from "react-icons/fa6";
import ModalMensaje from "@/components/ModalMensaje";
import { MensajeModal } from "@/interfaces/module/Personal/MensajeModal";

export default function ForgotPassword(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const router = useRouter();
  const [modal, setModal] = useState<MensajeModal | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const respuesta = await api.post("/auth/forgot-password", { email });
      if (respuesta.status === 200) {
        mostrarExito();
        setTimeout(() => {
          router.push("/login");
        }, 2500);
      }
    } catch (err) {
      const axiosError = err as AxiosError<{
        error?: string;
        message?: string;
      }>;
      const mensajeError =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        "Intente nuevamente";
      mostrarError(mensajeError);
    }
  };

  const mostrarExito = () => {
    setModal({
      tipo: "exito",
      mensaje: "¡Se ha enviado el correo correctamente! <br/>Te redireccionaremos para que Inicies Sesión",
    });
  };

  const mostrarError = (error: string) => {
    setModal({
      tipo: "error",
      mensaje: `No hemos podido enviar el correo. <br/>${error}`,
    });
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
        <h2 className="login__title">Recuperar Contraseña</h2>
        <p className="reset-text">
          Te enviaremos un correo para que recuperes tu contraseña
        </p>
        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label className="login__label">Email:</label>
            <div className="login__group">
              <FaEnvelope className="login__group--icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login__input"
              />
            </div>
          </div>

          <button type="submit" className="login__button reset-button">
            Recuperar Contraseña
          </button>
          <p className="login__text">
            ¿Tienes cuenta?{" "}
            <a href="/login" className="login__link">
              Iniciar Sesión
            </a>
          </p>
          <p className="login__text">
            Si no tienes una cuenta,{" "}
            <a href="/register" className="login__link">
              Resgistrarse{" "}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
