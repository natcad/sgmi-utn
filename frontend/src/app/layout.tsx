// src/app/layout.tsx
import type { Metadata } from "next";
import "../styles/globals.scss";
import { JSX } from "react";
import { Header } from "../components/Header";
import LayoutClient from "@/components/LayoutClient";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext"; 

export const metadata: Metadata = {
  title: "SGMI - Sistema de Gestión de Memorias",
  description:
    "Sistema de Gestión de Memorias de Grupos y Centros de Investigación - UTN FRLP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="es"suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <SidebarProvider>
            <div className="layout">
              <Header />
              <LayoutClient>{children}</LayoutClient>
            </div>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
