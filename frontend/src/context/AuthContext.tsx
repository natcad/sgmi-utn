"use client";

import { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { Usuario } from "@/interfaces/module/Personal/Usuario";
import api from "@/services/api";

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
        // 1. Si hay token en storage, api.ts lo usa.
        // 2. Si no hay, o está vencido, el backend devuelve 401.
        // 3. Tu INTERCEPTOR atrapa el 401, usa la Cookie para refrescar,
        //    y reintenta esta petición automáticamente.
        const res = await api.get<Usuario>("/auth/me");
        
        setUsuario(res.data);
      } catch (error) {
        // si el refresh token de la cookie también falló
        // o no existe.
        // console.error("Sesión no activa o expirada:", error);
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