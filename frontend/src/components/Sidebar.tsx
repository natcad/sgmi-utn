//src/components/Sidebar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FaUsers,
  FaUser,
  FaToolbox,
  FaGear,
  FaDoorOpen,
  FaDoorClosed,
} from "react-icons/fa6";
import {usePathname} from 'next/navigation';

export const Sidebar: React.FC = () => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const pathname=usePathname();

  const isActive= (path: string) : boolean => pathname ===path;
  return (
    <aside
      className={`sidebar ${expanded ? "sidebar--expanded" : ""}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <nav className="sidebar__nav">
        <div className="sidebar__div">
          <Link href="/grupos" className={`sidebar__link ${isActive('/grupos') ? 'sidebar__link--active' : ''}`}>
            <FaUsers className="sidebar__icon" />{" "}
            {expanded && <span>Grupos</span>}
          </Link>
        </div>
        <div className="sidebar__div">
          <Link href="/personal" className={`sidebar__link ${isActive('/personal')} ? 'sidebar__link--active' : ''}`}>
            <FaUser className="sidebar__icon" />{" "}
            {expanded && <span>Personal</span>}
          </Link>
        </div>
        <div className="sidebar__div">
          <Link href="/equipamiento" className={`sidebar__link ${isActive('/equipamiento')} ? 'sidebar__link--active' : ''}`}>
            <FaToolbox className="sidebar__icon" />{" "}
            {expanded && <span>Equipamiento</span>}
          </Link>
        </div>
        <div className="sidebar__div">
          <Link href="/configuracion" className={`sidebar__link ${isActive('/configuracion')} ? 'sidebar__link--active' : ''}`}>
            <FaGear className="sidebar__icon" />{" "}
            {expanded && <span>Configuración</span>}
          </Link>
        </div>
      </nav>
      <div className="sidebar__footer">
        <div className="sidebar__div">
          <Link href="/logout" className={`sidebar__link ${isActive('/logout')} ? 'sidebar__link--active' : ''}`}>
            <FaDoorClosed className="sidebar__icon" />{" "}
            {expanded && <span>Cerrar Sesión</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
};
