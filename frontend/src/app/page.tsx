import HomeClient from "@/components/HomeClient";
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
 return(
  <HomeClient/>
 )
}
