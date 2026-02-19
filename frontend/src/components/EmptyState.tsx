"use client";
import React from "react";
import { FaInbox } from "react-icons/fa6";

export default function EmptyState({
  title = "No hay resultados",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="placeholder placeholder--empty">
      <FaInbox className="placeholder__icon" aria-hidden />
      <div className="placeholder__title">{title}</div>
      {description && <div className="placeholder__text">{description}</div>}
    </div>
  );
}
