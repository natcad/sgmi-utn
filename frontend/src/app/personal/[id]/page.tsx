"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/services/api";
import axios from "axios";
import { PersonalResponse, Investigador, EnFormacion } from "@/interfaces/module/Personal/Personal";
import { FuenteFinanciamiento } from "@/interfaces/module/Personal/FuenteFinanciamiento";
import { FaUser } from "react-icons/fa6";

export default function ProfileCard() {
  const { id } = useParams();
  const [profile, setProfile] = useState<PersonalResponse | null>(null);

  // --- TYPE GUARDS ---
  const isInvestigador = (p: PersonalResponse): p is Investigador =>
    p.ObjectType === "investigador";
  const isEnFormacion = (p: PersonalResponse): p is EnFormacion =>
    p.ObjectType === "en formacion";

  const fetchProfile = async () => {
    if (!id) return;
    try {
      const res = await api.get<PersonalResponse>(`/personal/${id}`);
      setProfile(res.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) return;
      console.error("Error cargando perfil:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (!profile) return <p>Cargando...</p>;

  const investigador = isInvestigador(profile) ? profile : null;
  const enFormacion = isEnFormacion(profile) ? profile : null;

  const displayValue = (value: any, type?: "date") => {
    if (value === null || value === undefined || value === "") return "-";
    if (type === "date") {
      if (typeof value === "string") {
        // Manejar formato ISO: "2027-12-12T00:00:00.000Z" -> "2027-12-12"
        const datePart = value.split("T")[0];
        if (datePart.includes("-")) {
          const [year, month, day] = datePart.split("-");
          return `${day}/${month}/${year}`;
        }
      }
      // Si es un objeto Date o string válido, convertir a formato dd/mm/yyyy
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }
    return value;
  };

  return (
    <div className="profilecard">
      {/* Header */}
      <div className="profilecard__card profilecard__header-card">
        <div className="profilecard__header">
          <div className="profilecard__img-placeholder">
            {profile.Usuario?.PerfilUsuario?.fotoPerfil ? (
              <img 
                src={profile.Usuario.PerfilUsuario.fotoPerfil} 
                alt={`${profile.Usuario.nombre} ${profile.Usuario.apellido}`}
                className="profilecard__img"
              />
            ) : (
              <FaUser size={100} />
            )}
          </div>
          <div className="profilecard__info">
            <h1 className="profilecard__name">
              {profile.Usuario.nombre} {profile.Usuario.apellido}
            </h1>
            <p className="profilecard__detail">
              Correo electrónico: <a href={`mailto:${profile.Usuario.email}`}>{profile.Usuario.email}</a>
            </p>
            {profile.Usuario.PerfilUsuario?.telefono && (
              <p className="profilecard__detail">Teléfono: {profile.Usuario.PerfilUsuario.telefono}</p>
            )}
            {profile.Usuario.PerfilUsuario?.fechaNacimiento && (
              <p className="profilecard__detail">
                Fecha de nacimiento: {displayValue(profile.Usuario.PerfilUsuario.fechaNacimiento, "date")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Grupo */}
      {profile.grupo?.nombre && (
        <div className="profilecard__card">
          <h2 className="profilecard__section-title">Grupo</h2>
          <div className="profilecard__stats">
            <div className="profilecard__stat">
              <label>Nombre del Grupo</label>
              <p>{profile.grupo.nombre}</p>
            </div>
            {profile.grupo.siglas && (
              <div className="profilecard__stat">
                <label>Siglas</label>
                <p>{profile.grupo.siglas}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Datos Laborales */}
      <div className="profilecard__card">
        <h2 className="profilecard__section-title">Datos Laborales</h2>
        <div className="profilecard__stats">
          <div className="profilecard__stat">
            <label>Rol</label>
            <p>{profile.rol}</p>
          </div>

          {enFormacion && (
            <div className="profilecard__stat">
              <label>Tipo de Formación</label>
              <p>{enFormacion.tipoFormacion}</p>
            </div>
          )}

          <div className="profilecard__stat">
            <label>Horas Semanales</label>
            <p>{profile.horasSemanales}</p>
          </div>
        </div>
      </div>

      {/* Categoría UTN (solo para Investigadores) */}
      {investigador && (
        <div className="profilecard__card">
          <h2 className="profilecard__section-title">Categoría UTN</h2>
          <div className="profilecard__stats">
            <div className="profilecard__stat">
              <label>Categoría UTN</label>
              <p>{investigador.categoriaUTN}</p>
            </div>
            <div className="profilecard__stat">
              <label>Dedicación</label>
              <p>{investigador.dedicacion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Programa de Incentivos */}
      {investigador?.ProgramaIncentivo && (
        <div className="profilecard__card">
          <h2 className="profilecard__section-title">Programa de Incentivos</h2>
          <div className="profilecard__stats">
            <div className="profilecard__stat">
              <label>Estado</label>
              <p>{investigador.ProgramaIncentivo.estado}</p>
            </div>
            <div className="profilecard__stat">
              <label>Vencimiento</label>
              <p>{displayValue(investigador.ProgramaIncentivo.fechaVencimiento, "date")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Fuentes de Financiamiento */}
      {enFormacion?.fuentesDeFinanciamiento?.length ? (
        <div className="profilecard__card">
          <h2 className="profilecard__section-title">Formación</h2>
          {enFormacion.fuentesDeFinanciamiento.map((fuente: FuenteFinanciamiento) => (
            <div key={fuente.id} className="profilecard__stats fuente-financiamiento-detalle">
              <div className="profilecard__stat">
                <label>Organismo</label>
                <p>{fuente.organismo}</p>
              </div>
              <div className="profilecard__stat">
                <label>Monto</label>
                <p>{fuente.monto}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
