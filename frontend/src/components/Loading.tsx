"use client";
import React from "react";

export default function Loading({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="placeholder placeholder--loading">
      <div className="placeholder__spinner" aria-hidden />
      <div className="placeholder__text">{message}</div>
    </div>
  );
}
