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
    p.ObjectType === "en formación";

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

  // Solo usamos type guards para acceder a campos específicos
  const investigador = isInvestigador(profile) ? profile : null;
  const enFormacion = isEnFormacion(profile) ? profile : null;

  const displayValue = (value: any, type?: "date") => {
    if (value === null || value === undefined || value === "") return "-";
    if (type === "date") return new Date(value).toLocaleDateString("es-ES");
    return value;
  };

  return (
    <div className="profilecard">
      {/* Header */}
      <div className="profilecard__card profilecard__header-card">
        <div className="profilecard__header">
          <div className="profilecard__img-placeholder">
            <FaUser size={100} />
          </div>
          <div className="profilecard__info">
            <h1 className="profilecard__name">
              {profile.Usuario.nombre} {profile.Usuario.apellido}
            </h1>
            {profile.grupo?.nombre && <p className="profilecard__group-name">{profile.grupo.nombre}</p>}
            {investigador && <p className="profilecard__detail">Categoría UTN: {investigador.categoriaUTN}</p>}
            <p className="profilecard__detail">
              Correo electrónico: <a href={`mailto:${profile.Usuario.email}`}>{profile.Usuario.email}</a>
            </p>
          </div>
        </div>
      </div>

      {/* Datos Laborales */}
      <div className="profilecard__card">
        <h2 className="profilecard__section-title">Datos Laborales</h2>
        <div className="profilecard__stats">
          <div className="profilecard__stat">
            <label>Rol</label>
            <p>{profile.rol}</p>
          </div>
          <div className="profilecard__stat">
            <label>Horas Semanales</label>
            <p>{profile.horasSemanales}</p>
          </div>

          {investigador && (
            <>
              <div className="profilecard__stat">
                <label>Categoría UTN</label>
                <p>{investigador.categoriaUTN}</p>
              </div>
              <div className="profilecard__stat">
                <label>Dedicación</label>
                <p>{investigador.dedicacion}</p>
              </div>
            </>
          )}

          {enFormacion && (
            <div className="profilecard__stat">
              <label>Tipo de Formación</label>
              <p>{enFormacion.tipoFormacion}</p>
            </div>
          )}
        </div>
      </div>

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
