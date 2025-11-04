"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "../components/Sidebar";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.startsWith("/login") || pathname?.startsWith("/register");
console.log(isAuthPage)
  return (
    <div className="layout">
      {!isAuthPage && <Sidebar />}
      <div className={isAuthPage ? "" : "main-content"}>
        <main>{children}</main>
      </div>
    </div>
  );
}
