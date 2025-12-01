// src/context/AuthContext.tsx
"use client";
import { createContext, useState, ReactNode, useContext, useEffect } from "react";
import api from "@/services/api";

interface Usuario {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  rol: string;
}

interface AuthContextProps {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
  cargandoUsuario: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  usuario: null,
  setUsuario: () => {},
  cargandoUsuario: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setCargandoUsuario(false);
          return;
        }

        const res = await api.get<Usuario>("/auth/me");
        setUsuario(res.data);
      } catch (error) {
        console.error("Error obteniendo usuario actual:", error);
        setUsuario(null);
      } finally {
        setCargandoUsuario(false);
      }
    };

    init();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, cargandoUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
