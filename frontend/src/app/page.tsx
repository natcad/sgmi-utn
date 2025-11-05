import { Metadata } from "next";
import {
  FaUsers,
  FaUser,
  FaToolbox
} from "react-icons/fa6";
export const metadata: Metadata = {
  title: "SGMI - Sistema de Gestion de Memorias de Grupos de Investigación - UTN FRLP",
  description: "Sistema de Gestión de Memorias de Grupos y Centros de Investigación - UTN FRLP",
};
export default function Home() {
  return (
    <div className="home-sgmi">
        <section className="home-sgmi__header">
          <h1 className="home-sgmi__title">
          Bienvenido
                  </h1>
        <p className="home-sgmi__subtitle">
          al Sistema de Gestión de Memorias de Investigación (SGMI)
        </p>
        <p className="home-sgmi__text">
          Este sistema permite administrar la información institucional de los{" "}
          <strong>grupos de investigación</strong>, su{" "}
          <strong>personal</strong> y el <strong>equipamiento</strong>{" "}
          asociado, facilitando la elaboración de la{" "}
          <strong>Memoria Anual</strong> de cada unidad académica.
        </p>
      </section>

      <section className="home-sgmi__modules">
        <div className="home-sgmi__card">
          <FaUsers className="home-sgmi__icon" />
          <h3>Grupos de Investigación</h3>
          <p>
            Creá, editá o consultá grupos registrados, incluyendo sus objetivos,
            horas de trabajo e integrantes asociados.
          </p>
        </div>

        <div className="home-sgmi__card">
          <FaUser className="home-sgmi__icon" />
          <h3>Personal</h3>
          <p>
            Gestioná investigadores, becarios y personal de apoyo. Asigná roles,
            dedicaciones y vinculaciones con los distintos grupos.
          </p>
        </div>

        <div className="home-sgmi__card">
          <FaToolbox className="home-sgmi__icon" />
          <h3>Equipamiento</h3>
          <p>
            Administrá los equipos y recursos técnicos de los grupos, registrá
            costos y fechas de compra, y gestioná el presupuesto de los grupos.
          </p>
        </div>
      </section>

      <div className="home-sgmi__footer">
        <p>
          SGMI es una herramienta desarrollada para la{" "}
          <strong>Universidad Tecnológica Nacional - Facultad Regional La Plata</strong>{" "}
          para centralizar y sistematizar la información de los grupos y centros
          de investigación.
        </p>
      </div>
    </div>
       

   
  );
}
