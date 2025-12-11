"use client";

import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import Modal from "@/components/Modal";
import InputField from "@/components/InputField";
import AlertMessage from "@/components/AlertMessage";
import SolicitudesTable from "@/components/SolicitudesTable";

export default function SolicitudesPage() {
    const { usuario } = useAuth(); // Hook simplificado
    const [solicitudes, setSolicitudes] = useState([]);
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);

    // -------------------------
    // Obtener solicitudes
    // -------------------------
    const fetchSolicitudes = async () => {
        if (!usuario) return;

        try {
            const res = await fetch(`/api/solicitudes?usuarioId=${usuario.id}`, {
                method: "GET",
            });
            const data = await res.json();

            if (data.ok) setSolicitudes(data.solicitudes);
            else setError(data.error || "No se pudieron cargar las solicitudes");
        } catch (err) {
            console.error("Error al cargar solicitudes:", err);
            setError("Error de conexión al cargar solicitudes");
        }
    };

    useEffect(() => {
        if (usuario) fetchSolicitudes();
    }, [usuario]);

    // -------------------------
    // Crear solicitud
    // -------------------------
    const handleCrear = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (titulo.trim().length < 3 || descripcion.trim().length < 5) {
            setError("Título o descripción demasiado cortos");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/solicitudes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ titulo, descripcion, usuarioId: usuario.id }),
            });
            const data = await res.json();

            if (data.ok) {
                setSuccess("Solicitud creada correctamente");
                setTitulo("");
                setDescripcion("");
                fetchSolicitudes();
            } else setError(data.error || "Error al crear solicitud");
        } catch (err) {
            console.error("Error al crear solicitud:", err);
            setError("Error de conexión al crear solicitud");
        } finally {
            setLoading(false);
        }
    };

    // -------------------------
    // Actualizar solicitud (solo admin)
    // -------------------------
    const handleActualizar = async (id, nuevoEstado) => {
        if (!usuario) return;

        setError("");
        setSuccess("");

        if (usuario.rol !== "ADMIN") {
            setError("Solo administradores pueden actualizar solicitudes");
            return;
        }

        try {
            const res = await fetch("/api/solicitudes", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, estado: nuevoEstado, usuarioId: usuario.id }),
            });
            const data = await res.json();

            if (data.ok) {
                setSuccess(`Solicitud actualizada a ${nuevoEstado}`);
                setModalOpen(false);
                fetchSolicitudes();
            } else setError(data.error || "Error al actualizar solicitud");
        } catch (err) {
            console.error("Error al actualizar solicitud:", err);
            setError("Error de conexión al actualizar solicitud");
        }
    };

    // -------------------------
    // Eliminar solicitud (solo admin)
    // -------------------------
    const handleEliminar = async (id) => {
        if (!usuario) return;

        if (usuario.rol !== "ADMIN") {
            setError("Solo administradores pueden eliminar solicitudes");
            return;
        }

        if (!confirm(`¿Desea eliminar la solicitud ${id}?`)) return;

        setError("");
        setSuccess("");

        try {
            const res = await fetch(`/api/solicitudes?id=${id}&usuarioId=${usuario.id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.ok) {
                setSuccess("Solicitud eliminada correctamente");
                fetchSolicitudes();
            } else setError(data.error || "Error al eliminar solicitud");
        } catch (err) {
            console.error("Error al eliminar solicitud:", err);
            setError("Error de conexión al eliminar solicitud");
        }
    };

    if (!usuario) return <p>Redirigiendo al login...</p>;

    return (
        <main style={{ maxWidth: "800px", margin: "50px auto", padding: "0 20px" }}>
            <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Gestión de Solicitudes</h1>
            <p style={{ marginBottom: "20px" }}>
                Bienvenido, {usuario.nombre} ({usuario.rol})
            </p>

            {/* Formulario para crear solicitud */}
            <form
                onSubmit={handleCrear}
                style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "20px" }}
            >
                <InputField
                    label="Título"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                />
                <InputField
                    label="Descripción"
                    type="textarea"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "10px",
                        backgroundColor: "#1976d2",
                        color: "#fff",
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer",
                        borderRadius: "4px",
                    }}
                >
                    {loading ? "Creando..." : "Crear Solicitud"}
                </button>
            </form>

            {/* Mensajes */}
            {error && <AlertMessage type="error" message={error} />}
            {success && <AlertMessage type="success" message={success} />}

            {/* Tabla de solicitudes */}
            <SolicitudesTable
                solicitudes={solicitudes}
                rol={usuario.rol}
                onUpdate={(s) => {
                    setSelectedSolicitud(s);
                    setModalOpen(true);
                }}
                onDelete={handleEliminar}
            />

            {/* Modal para actualizar estado (solo admin) */}
            {modalOpen && selectedSolicitud && (
                <Modal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSubmit={() => handleActualizar(selectedSolicitud.id, selectedSolicitud.estado)}
                >
                    <h2>Actualizar Estado</h2>
                    <p>
                        <strong>{selectedSolicitud.titulo}</strong>
                    </p>
                    <select
                        value={selectedSolicitud.estado || "PENDIENTE"}
                        onChange={(e) =>
                            setSelectedSolicitud({ ...selectedSolicitud, estado: e.target.value })
                        }
                        style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
                    >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="APROBADO">Aprobado</option>
                        <option value="RECHAZADO">Rechazado</option>
                    </select>
                </Modal>
            )}
        </main>
    );
}
