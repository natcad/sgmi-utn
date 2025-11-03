//src/components/Header.tsx
"use client";
import Image from "next/image";
import React from "react";
export const Header: React.FC = () => {
  return (
    <header className="header">
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
