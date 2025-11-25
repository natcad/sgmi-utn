//src/context/AuthContext.tsx
"use client";
import { createContext, useState, ReactNode, useContext } from "react";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}
interface AuthContextProps{
    usuario: Usuario | null;
    setUsuario: (usuario: Usuario | null) => void;
}
const AuthContext = createContext<AuthContextProps>({
    usuario: null,
    setUsuario: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [usuario, setUsuario] = useState<Usuario | null>(null);

    return (
        <AuthContext.Provider value={{ usuario, setUsuario }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);