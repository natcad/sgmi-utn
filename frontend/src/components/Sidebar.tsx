//src/components/Sidebar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaUsers,
  FaUser,
  FaToolbox,
  FaGear,
  FaDoorOpen,
  FaHouse,
} from "react-icons/fa6";
import { usePathname } from "next/navigation";
import api from "../services/api";
export const Sidebar: React.FC = () => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      router.push("/login");
    } catch (error) {
      console.error("error al cerrar sesión", error);
    }
  };
  const isActive = (path: string): boolean => pathname === path;
  return (
    <aside
      className={`sidebar ${expanded ? "sidebar--expanded" : ""}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <nav className="sidebar__nav">
        <div className="sidebar__div">
          <Link
            href="/"
            className={`sidebar__link ${
              isActive("/") ? "sidebar__link--active" : ""
            }`}
          >
            <FaHouse className="sidebar__icon" />{" "}
            {expanded && <span>Inicio</span>}
          </Link>
        </div>
        <div className="sidebar__div">
          <Link
            href="/grupos"
            className={`sidebar__link ${
              isActive("/grupos") ? "sidebar__link--active" : ""
            }`}
          >
            <FaUsers className="sidebar__icon" />{" "}
            {expanded && <span>Grupos</span>}
          </Link>
        </div>
        <div className="sidebar__div">
          <Link
            href="/personal"
            className={`sidebar__link ${isActive(
              "/personal"
            )} ? 'sidebar__link--active' : ''}`}
          >
            <FaUser className="sidebar__icon" />{" "}
            {expanded && <span>Personal</span>}
          </Link>
        </div>
        <div className="sidebar__div">
          <Link
            href="/equipamiento"
            className={`sidebar__link ${isActive(
              "/equipamiento"
            )} ? 'sidebar__link--active' : ''}`}
          >
            <FaToolbox className="sidebar__icon" />{" "}
            {expanded && <span>Equipamiento</span>}
          </Link>
        </div>
        <div className="sidebar__div">
          <Link
            href="/configuracion"
            className={`sidebar__link ${isActive(
              "/configuracion"
            )} ? 'sidebar__link--active' : ''}`}
          >
            <FaGear className="sidebar__icon" />{" "}
            {expanded && <span>Configuración</span>}
          </Link>
        </div>
      </nav>
      <div className="sidebar__footer">
        <div className="sidebar__div">
          <div
            onClick={handleLogout}
            className={`sidebar__link ${isActive(
              "/logout"
            )} ? 'sidebar__link--active' : ''}`}
          >
            <FaDoorOpen className="sidebar__icon" />{" "}
            {expanded && <span>Cerrar Sesión</span>}
          </div>
        </div>
      </div>
    </aside>
  );
};
