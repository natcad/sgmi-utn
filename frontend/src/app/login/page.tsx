"use client";

import { JSX, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import {
  FaCircleUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa6";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export default function Login(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { setUsuario } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const respuesta = await api.post<{
        accessToken: string;
        usuario: Usuario;
      }>("/auth/login", { email, password });
      const { accessToken, usuario } = respuesta.data;
      setUsuario(usuario);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      if (respuesta.status === 200) {
        router.push("/");
        console.log("Usuario logueado:", usuario);
        // Redirige a la página de inicio después del login exitoso
      }
    } catch (err) {
      const axiosError = err as AxiosError<{
        error?: string;
        message?: string;
      }>;
      setError(
        axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          "Error en el inicio de sesión"
      );
    }
  };
  return (
    <div className="login">
      <div className="login__card">
        <FaCircleUser className="login__icon" />
        <h2 className="login__title">Iniciar Sesión</h2>
        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label className="login__label">Email:</label>
            <div className="login__group">
                <FaEnvelope className="login__group--icon"/>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login__input"
              />
            </div>
          </div>
          <div className="login__field">
            <label className="login__label">Contraseña:</label>
            <div className="login__group">
                <FaLock className="login__group--icon"/>
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
          {error && <p className="login__error">{error}</p>}
          <button type="submit" className="login__button">
            Iniciar Sesión
          </button>
          <p className="login__text">
            ¿Olvidaste tu contraseña?{" "}
            <a href="#" className="login__link">
              Recuperarla
            </a>
          </p>
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
