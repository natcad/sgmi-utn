//src/components/Header.tsx

"use client";
import Image from "next/image";
import React, { useContext } from "react";
import { FaBars } from "react-icons/fa6";
import { SidebarContext } from "../context/SidebarContext";

export const Header: React.FC = () => {
  const { toggleSidebar } = useContext(SidebarContext);

  return (
    <header className="header">
      <button 
        className="header__menu-btn"
        onClick={toggleSidebar}
        aria-label="Abrir menú"
      >
        <FaBars />
      </button>
      <Image
        src="/utn.svg"
        alt="UTN Logo"
        width={75}
        height={75}
        className="header__logo"
        priority
      />

      <div className="header__title">
        <h1 className="header__h1">SGMI</h1>
        <p className="header__p">
          Sistema de Gestión <br />
          de Memorias
        </p>
      </div>
    </header>
  );
};
