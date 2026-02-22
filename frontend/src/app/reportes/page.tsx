"use client";

import { useEffect, useMemo, useState } from "react";
import { FaFileExcel, FaFilter, FaLayerGroup } from "react-icons/fa6";

import EmptyState from "@/components/EmptyState";
import Loading from "@/components/Loading";
import ModalMensaje from "@/components/ModalMensaje";
import MemoriasTable from "@/components/memorias/MemoriasTable";
import { useAuth } from "@/context/AuthContext";
import { Grupo } from "@/interfaces/module/Grupos/Grupos";
import { MemoriaResumen } from "@/interfaces/module/Memorias/MemoriaResumen";
import api from "@/services/api";
import { getGrupos } from "@/services/grupos.api";
import { exportarGrupoMemoriasExcel } from "@/services/memoria.api";
import {
	descargarBlob,
	exportarResumenGruposExcel,
} from "@/services/reporte.api";

type ModalData = {
	tipo: "exito" | "error" | "warning";
	mensaje: string;
};

const ESTADOS = ["Enviada", "Aprobada", "Rechazada"] as const;

export default function ReportesPage() {
	const { usuario, cargandoUsuario } = useAuth();

	const [grupos, setGrupos] = useState<Grupo[]>([]);
	const [cargando, setCargando] = useState(true);
	const [modal, setModal] = useState<ModalData | null>(null);

	const [grupoSeleccionado, setGrupoSeleccionado] = useState<number | "">("");
	const [from, setFrom] = useState<string>("");
	const [to, setTo] = useState<string>("");
	const [estados, setEstados] = useState<string[]>([]);

	const [descargandoResumen, setDescargandoResumen] = useState(false);
	const [descargandoEstadoGrupo, setDescargandoEstadoGrupo] = useState(false);
	const [memoriasGrupo, setMemoriasGrupo] = useState<MemoriaResumen[]>([]);
	const [cargandoMemoriasGrupo, setCargandoMemoriasGrupo] = useState(false);
	const [filtroTablaMemorias, setFiltroTablaMemorias] = useState("");

	const esAdmin =
		!!usuario?.rol && ["admin", "administrador"].includes(usuario.rol.toLowerCase());

	useEffect(() => {
		const cargarGrupos = async () => {
			if (cargandoUsuario || !esAdmin) {
				setCargando(false);
				return;
			}

			try {
				setCargando(true);
				const data = await getGrupos();
				setGrupos(data);
			} catch (error) {
				console.error(error);
				setModal({
					tipo: "error",
					mensaje: "No se pudieron cargar los grupos para reportes.",
				});
			} finally {
				setCargando(false);
			}
		};

		cargarGrupos();
	}, [cargandoUsuario, esAdmin]);

	const anioActual = new Date().getFullYear();
	const years = useMemo(
		() => Array.from({ length: 10 }, (_, idx) => String(anioActual - idx)),
		[anioActual],
	);

	useEffect(() => {
		const cargarMemoriasGrupo = async () => {
			if (!grupoSeleccionado) {
				setMemoriasGrupo([]);
				return;
			}

			try {
				setCargandoMemoriasGrupo(true);
				const { data } = await api.get<MemoriaResumen[]>("/memorias", {
					params: {
						grupoId: Number(grupoSeleccionado),
						incluirDetalle: false,
					},
				});
				setMemoriasGrupo(Array.isArray(data) ? data : []);
			} catch (error) {
				console.error(error);
				setMemoriasGrupo([]);
				setModal({
					tipo: "error",
					mensaje: "No se pudieron cargar las memorias del grupo seleccionado.",
				});
			} finally {
				setCargandoMemoriasGrupo(false);
			}
		};

		cargarMemoriasGrupo();
	}, [grupoSeleccionado]);

	const memoriasFiltradasGrupo = useMemo(() => {
		let resultado = [...memoriasGrupo];

		if (from) resultado = resultado.filter((m) => Number(m.anio) >= Number(from));
		if (to) resultado = resultado.filter((m) => Number(m.anio) <= Number(to));
		if (estados.length) {
			const setEstados = new Set(estados.map((e) => e.toLowerCase()));
			resultado = resultado.filter((m) => setEstados.has(String(m.estado).toLowerCase()));
		}

		return resultado.sort((a, b) => {
			if (b.anio !== a.anio) return b.anio - a.anio;
			return b.version - a.version;
		});
	}, [memoriasGrupo, from, to, estados]);

	const toggleEstado = (estado: string) => {
		setEstados((prev) =>
			prev.includes(estado) ? prev.filter((item) => item !== estado) : [...prev, estado],
		);
	};

	const validarRangoAnios = () => {
		if (!from || !to) return true;
		if (Number(from) > Number(to)) {
			setModal({
				tipo: "warning",
				mensaje: "El año 'Desde' no puede ser mayor al año 'Hasta'.",
			});
			return false;
		}
		return true;
	};

	const handleExportarResumen = async () => {
		if (!validarRangoAnios()) return;

		try {
			setDescargandoResumen(true);
			const blob = await exportarResumenGruposExcel({
				grupoIds: grupoSeleccionado ? [Number(grupoSeleccionado)] : undefined,
				from: from ? Number(from) : undefined,
				to: to ? Number(to) : undefined,
				estado: estados.length ? estados : undefined,
			});

			const nombreGrupo =
				grupoSeleccionado === ""
					? "todos"
					: grupos.find((g) => g.id === Number(grupoSeleccionado))?.siglas || "grupo";

			descargarBlob(blob, `Reporte_resumen_${nombreGrupo}.xlsx`);
		} catch (error) {
			console.error(error);
			setModal({
				tipo: "error",
				mensaje: "No se pudo exportar el resumen de grupos.",
			});
		} finally {
			setDescargandoResumen(false);
		}
	};

	const handleExportarMemoriasGrupo = async () => {
		if (!grupoSeleccionado) {
			setModal({
				tipo: "warning",
				mensaje: "Seleccioná un grupo para exportar sus memorias.",
			});
			return;
		}

		if (!validarRangoAnios()) return;

		try {
			setDescargandoEstadoGrupo(true);
			const grupoId = Number(grupoSeleccionado);
			const grupo = grupos.find((item) => item.id === grupoId);

			const blob = await exportarGrupoMemoriasExcel(grupoId, {
				from: from ? Number(from) : undefined,
				to: to ? Number(to) : undefined,
				estado: estados.length ? estados : undefined,
			});
			descargarBlob(blob, `Reporte_memorias_${grupo?.siglas || grupoId}.xlsx`);
		} catch (error) {
			console.error(error);
			setModal({
				tipo: "error",
				mensaje: "No se pudieron exportar las memorias del grupo.",
			});
		} finally {
			setDescargandoEstadoGrupo(false);
		}
	};

	if (cargandoUsuario || cargando) {
		return (
			<div className="reportes">
				<Loading message="Cargando reportes..." />
			</div>
		);
	}

	if (!esAdmin) {
		return (
			<div className="reportes">
				<EmptyState
					title="Acceso restringido"
					description="Esta sección está disponible solo para administradores."
				/>
			</div>
		);
	}

	return (
		<div className="reportes">
			<div className="reportes__header">
				<h1 className="reportes__title">Reportes de administración</h1>
			</div>

			<div className="reportes__card">
				<div className="reportes__card-title">
					<FaFilter /> Filtros
				</div>

				<div className="reportes__grid">
					<div className="reportes__field">
						<label>Grupo</label>
						<select
							value={grupoSeleccionado}
							onChange={(e) =>
								setGrupoSeleccionado(e.target.value ? Number(e.target.value) : "")
							}
						>
							<option value="">Todos los grupos</option>
							{grupos.map((grupo) => (
								<option key={grupo.id} value={grupo.id}>
									{grupo.siglas ? `${grupo.siglas} - ${grupo.nombre}` : grupo.nombre}
								</option>
							))}
						</select>
					</div>

					<div className="reportes__field">
						<label>Desde</label>
						<select value={from} onChange={(e) => setFrom(e.target.value)}>
							<option value="">Sin límite</option>
							{years.map((year) => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
					</div>

					<div className="reportes__field">
						<label>Hasta</label>
						<select value={to} onChange={(e) => setTo(e.target.value)}>
							<option value="">Sin límite</option>
							{years.map((year) => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="reportes__estados">
					<span className="reportes__estados-label">Estado</span>
					<div className="reportes__estados-list">
						{ESTADOS.map((estado) => (
							<label key={estado} className="reportes__estado-item">
								<input
									type="checkbox"
									checked={estados.includes(estado)}
									onChange={() => toggleEstado(estado)}
								/>
								{estado}
							</label>
						))}
					</div>
				</div>

				<div className="reportes__actions">
					<button
						type="button"
						className="reportes__btn"
						onClick={handleExportarResumen}
						disabled={descargandoResumen || descargandoEstadoGrupo}
					>
						<FaFileExcel />
						{descargandoResumen ? "Generando resumen..." : "Exportar resumen"}
					</button>

					<button
						type="button"
						className="reportes__btn reportes__btn--secondary"
						onClick={handleExportarMemoriasGrupo}
						disabled={descargandoResumen || descargandoEstadoGrupo}
					>
						<FaLayerGroup />
						{descargandoEstadoGrupo
							? "Exportando memorias..."
							: "Exportar memorias del grupo"}
					</button>
				</div>
			</div>

			{grupoSeleccionado !== "" && (
				<div className="reportes__card">
					<div className="reportes__card-title">
						<FaLayerGroup /> Memorias del grupo seleccionado
					</div>

					{cargandoMemoriasGrupo ? (
						<Loading message="Cargando memorias del grupo..." />
					) : memoriasFiltradasGrupo.length === 0 ? (
						<EmptyState
							title="Sin memorias para mostrar"
							description="No hay memorias para este grupo con los filtros aplicados."
						/>
					) : (
						<div className="reportes__table-wrap">
							<input
								type="text"
								className="reportes__table-search"
								placeholder="Buscar en memorias del grupo..."
								value={filtroTablaMemorias}
								onChange={(e) => setFiltroTablaMemorias(e.target.value)}
							/>
							<MemoriasTable
								data={memoriasFiltradasGrupo}
								esAdmin={false}
								globalFilter={filtroTablaMemorias}
								onGlobalFilterChange={setFiltroTablaMemorias}
								showActions={false}
							/>
						</div>
					)}
				</div>
			)}

			{modal && <ModalMensaje tipo={modal.tipo} mensaje={modal.mensaje} onClose={() => setModal(null)} />}
		</div>
	);
}
