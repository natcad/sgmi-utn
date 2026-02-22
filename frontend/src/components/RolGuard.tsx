import { useAuth } from "@/context/AuthContext";

interface RolGuardProps {
  rolPermitido: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RolGuard = ({
  rolPermitido,
  children,
  fallback = null,
}: RolGuardProps) => {
  const { usuario, cargandoUsuario } = useAuth();
  if (cargandoUsuario) return null;
  if (usuario && rolPermitido === usuario.rol) {
    return <> {children}</>;
  }
  return <>{fallback}</>;
};
