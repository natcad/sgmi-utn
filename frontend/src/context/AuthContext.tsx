//src/context/AuthContext.tsx
"use client";
import { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { Usuario } from "@/interfaces/module/Personal/Usuario";

interface AuthContextProps{
    usuario: Usuario | null;
    setUsuario: (usuario: Usuario | null) => void;
}
const AuthContext = createContext<AuthContextProps>({
    usuario: null,
    setUsuario: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [usuario, setUsuarioState] = useState<Usuario | null>(null);

    const setUsuario = (usuario: Usuario | null) => {
        if(usuario){
            localStorage.setItem("usuario", JSON.stringify(usuario));
        }else{
            localStorage.removeItem("usuario");
        }
        setUsuarioState(usuario);
    }
    useEffect(() => {
    const stored = localStorage.getItem("usuario");
    if (stored) {
      setUsuarioState(JSON.parse(stored));
    }}, []);

    return (
        <AuthContext.Provider value={{ usuario, setUsuario }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);