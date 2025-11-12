"use client";

import { JSX, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { AxiosError } from "axios";
import { FaCircleUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa6";
import ModalMensaje from "@/components/ModalMensaje";
import { MensajeModal } from "@/interfaces/MensajeModal";
import {
  validatePassword,
  ResultadoValidacion,
} from "@/utils/passwordValidation";
export default function ResetPassword(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [modal, setModal] = useState<MensajeModal | null>(null);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    if (!updatedForm.password && !updatedForm.confirmPassword) {
      setPasswordErrors([]);
      return;
    }
    if (name === "password") {
      if (!value) {
        setPasswordErrors([]);
        return;
      }
      const resultado: ResultadoValidacion = validatePassword(value);
      const errors = [...resultado.messages];

      if (formData.confirmPassword && value !== formData.confirmPassword) {
        errors.push("Las contraseñas no coinciden.");
      }

      setPasswordErrors(errors);
    }

    if (name === "confirmPassword") {
      if (!value) {
        setPasswordErrors([]);
        return;
      }
      const resultado: ResultadoValidacion = validatePassword(
        formData.password
      );
      const errors = [...resultado.messages];

      if (value !== formData.password) {
        errors.push("Las contraseñas no coinciden.");
      }

      setPasswordErrors(errors);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result: ResultadoValidacion = validatePassword(formData.password);
    const errors = [...result.messages];

    if (formData.password !== formData.confirmPassword) {
      errors.push("Las contraseñas no coinciden.");
    }

    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }
    try {
      const respuesta = await api.post("/auth/reset-password", {
        token,
        password: formData.password,
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

      <div className="login__card register">
        <FaCircleUser className="login__icon" />
        <h2 className="login__title">Restablecer Contraseña</h2>
        <p className="reset-text">
          Ingresa tu nueva contraseña para continuar con tu cuenta
        </p>
        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field register">
            <label className="login__label">Nueva Contraseña:</label>
            <div className="login__group register">
              <FaLock className="login__group--icon" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
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
          <div className="login__field register">
            <label className="login__label">Confirmar Contraseña:</label>
            <div className="login__group register">
              <FaLock className="login__group--icon" />
              <input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
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
          {passwordErrors.length > 0 && (
            <div className="login__errors">
              {passwordErrors.map((error, i) => (
                <p key={i} className="login__error">
                  {error}
                </p>
              ))}
            </div>
          )}
          <button type="submit" className="login__button">
            Restablecer Contraseña
          </button>
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
