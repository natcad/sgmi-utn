"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "../components/Sidebar";
import { PUBLIC_ROUTES } from "@/utils/publicRoutes";
export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage =PUBLIC_ROUTES.some((route)=>pathname?.startsWith(route));
    return (
    <div className="layout">
      {!isAuthPage && <Sidebar />}
      <div className={isAuthPage ? "" : "main-content"}>
        <main>{children}</main>
      </div>
    </div>
  );
}
