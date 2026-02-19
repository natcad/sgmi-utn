//src/components/Sidebar.tsx
"use client";
import { useState, useContext, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaUsers,
  FaUser,
  FaToolbox,
  FaGear,
  FaDoorOpen,
  FaHouse,
  FaFileLines,
  FaBookOpen,
} from "react-icons/fa6";
import { usePathname } from "next/navigation";
import api from "../services/api";
import { SidebarContext } from "../context/SidebarContext";

export const Sidebar: React.FC = () => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const { isOpen, closeSidebar } = useContext(SidebarContext);
  const pathname = usePathname();
  const router = useRouter();

  // Cerrar sidebar cuando cambia la ruta en móviles
  useEffect(() => {
    if (isOpen) {
      closeSidebar();
    }
  }, [pathname]);
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      // Clear any stored access token and default header
      try {
        localStorage.removeItem("accessToken");
      } catch (e) {}
      if (
        api.defaults.headers.common &&
        api.defaults.headers.common["Authorization"]
      ) {
        delete api.defaults.headers.common["Authorization"];
      }
      router.push("/login");
    } catch (error) {
      console.error("error al cerrar sesión", error);
    }
  };
  const isActive = (path: string): boolean => pathname === path;

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && <div className="sidebar__overlay" onClick={closeSidebar} />}

      <aside
        className={`sidebar ${expanded ? "sidebar--expanded" : ""} ${isOpen ? "sidebar--open" : ""}`}
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
              {(expanded || isOpen) && <span>Inicio</span>}
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
              {(expanded || isOpen) && <span>Grupos</span>}
            </Link>
          </div>
          <div className="sidebar__div">
            <Link
              href="/personal"
              className={`sidebar__link ${isActive(
                "/personal",
              )} ? 'sidebar__link--active' : ''}`}
            >
              <FaUser className="sidebar__icon" />{" "}
              {(expanded || isOpen) && <span>Personal</span>}
            </Link>
          </div>
          <div className="sidebar__div">
            <Link
              href="/equipamiento"
              className={`sidebar__link ${isActive(
                "/equipamiento",
              )} ? 'sidebar__link--active' : ''}`}
            >
              <FaToolbox className="sidebar__icon" />{" "}
              {(expanded || isOpen) && <span>Equipamiento</span>}
            </Link>
          </div>
          <div className="sidebar__div">
            <Link
              href="/memorias"
              className={`sidebar__link ${isActive(
                "/equipamiento",
              )} ? 'sidebar__link--active' : ''}`}
            >
              <FaBookOpen className="sidebar__icon" />{" "}
              {(expanded || isOpen) && <span>Memorias</span>}
            </Link>
          </div>

          <div className="sidebar__div">
            <Link
              href="/reportes"
              className={`sidebar__link ${isActive(
                "/reportes",
              )} ? 'sidebar__link--active' : ''}`}
            >
              <FaFileLines className="sidebar__icon" />{" "}
              {(expanded || isOpen) && <span>Reportes</span>}
            </Link>
          </div>
          <div className="sidebar__div">
            <Link
              href="/configuracion"
              className={`sidebar__link ${isActive(
                "/configuracion",
              )} ? 'sidebar__link--active' : ''}`}
            >
              <FaGear className="sidebar__icon" />{" "}
              {(expanded || isOpen) && <span>Configuración</span>}
            </Link>
          </div>
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__div">
            <div
              onClick={handleLogout}
              className={`sidebar__link ${isActive(
                "/logout",
              )} ? 'sidebar__link--active' : ''}`}
            >
              <FaDoorOpen className="sidebar__icon" />{" "}
              {(expanded || isOpen) && <span>Cerrar Sesión</span>}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
