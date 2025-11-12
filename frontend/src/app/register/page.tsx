"use client";
import { JSX, useState, FormEvent } from "react";
import api from "@/services/api";
import { AxiosError } from "axios";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa6";
import ModalMensaje from "@/components/ModalMensaje";
import { MensajeModal } from "@/interfaces/MensajeModal";
import { Usuario } from "@/interfaces/Usuario";
import {
  validatePassword,
  ResultadoValidacion,
} from "@/utils/passwordValidation";
export default function Register(): JSX.Element {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [modal, setModal] = useState<MensajeModal | null>(null);

  //validacion de contraseñas
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

    const usuario: Partial<Usuario> = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      password: formData.password,
    };
    try {
      await api.post("/auth/register", { usuario });
      setModal({
        tipo: "exito",
        mensaje:
          "¡Registro exitoso! <br/> Revise se su casilla de correo para confirmar su cuenta.",
      });
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        error?: string;
      }>;
      const mensajeError =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Error al restablecer la contraseña";
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
        <h2 className="login__title">Registrarse</h2>
        <p className="reset-text"></p>
        <form className="login__form register" onSubmit={handleSubmit}>
          <div className="register-row">
            {/* nombre */}
            <div className="login__field ">
              <label className="login__label ">Nombre *:</label>
              <div className="login__group ">
                <input
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="login__input no-icon "
                />
              </div>
            </div>
            {/* apellido */}
            <div className="login__field">
              <label className="login__label">Apellido *: </label>
              <div className="login__group">
                <input
                  name="apellido"
                  type="text"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                  className="login__input no-icon"
                />
              </div>
            </div>
          </div>
          {/* email */}
          <div className="login__field">
            <label className="login__label">Email *:</label>
            <div className="login__group register">
              <FaEnvelope className="login__group--icon" />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@email.com"
                required
                className="login__input"
              />
            </div>
          </div>
          {/*  contraseña*/}
          <div className="login__field register">
            <label className="login__label">Contraseña *:</label>
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
                className="login__toggle register"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          {/*confirmar  contraseña*/}
          <div className="login__field register">
            <label className="login__label">Confirmar Contraseña *:</label>
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
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
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
            Registrarse
          </button>
          <p className="login__text">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="login__link">
              Iniciar Sesión{" "}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
