"use client";

import { useEffect, useState } from "react";
import AlertMessage from "@/components/AlertMessage";

export default function AdminPage() {
    const [usuario, setUsuario] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    const [accionando, setAccionando] = useState(null);
    const [initialized, setInitialized] = useState(false);

    // Inicializar usuario
    useEffect(() => {
        const stored = sessionStorage.getItem("usuario");
        if (!stored) {
            setError("No autenticado. Redirigiendo...");
            setTimeout(() => (window.location.href = "/login"), 1500);
            setInitialized(true);
            return;
        }

        try {
            const parsed = JSON.parse(stored);
            if (parsed.rol !== "ADMIN") {
                setError("Acceso denegado. Redirigiendo...");
                setTimeout(() => (window.location.href = "/"), 1500);
            } else {
                setUsuario(parsed);
            }
        } catch {
            setError("Error al procesar usuario");
            setTimeout(() => (window.location.href = "/login"), 1500);
        } finally {
            setInitialized(true);
        }
    }, []);

    // Mensajes auto-limpiables
    useEffect(() => {
        if (!error) return;
        const timer = setTimeout(() => setError(""), 5000);
        return () => clearTimeout(timer);
    }, [error]);

    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => setSuccess(""), 5000);
        return () => clearTimeout(timer);
    }, [success]);

    // Cargar usuarios
    const fetchUsuarios = async () => {
        setLoadingUsuarios(true);
        try {
            const res = await fetch(`/api/admin?usuarioId=${usuario.id}`);
            const data = await res.json();
            if (data.ok) setUsuarios(data.usuarios);
            else setError(data.error);
        } catch {
            setError("Error de conexión al cargar usuarios");
        } finally {
            setLoadingUsuarios(false);
        }
    };

    useEffect(() => {
        if (usuario) fetchUsuarios();
    }, [usuario]);

    // Promover
    const promover = async (id) => {
        if (id === usuario.id) return setError("No puedes cambiar tu propio rol");

        setAccionando(id);

        try {
            const res = await fetch("/api/admin", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, usuarioId: usuario.id }),
            });
            const data = await res.json();
            if (data.ok) {
                setSuccess(`Usuario ${data.usuario.nombre} ahora es ADMIN`);
                fetchUsuarios();
            } else setError(data.error);
        } catch {
            setError("Error de conexión al promover usuario");
        } finally {
            setAccionando(null);
        }
    };

    // Degradar
    const degradar = async (id) => {
        if (id === usuario.id) return setError("No puedes cambiar tu propio rol");

        setAccionando(id);

        try {
            const res = await fetch("/api/admin", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, usuarioId: usuario.id }),
            });
            const data = await res.json();
            if (data.ok) {
                setSuccess(`Usuario ${data.usuario.nombre} ahora es USUARIO`);
                fetchUsuarios();
            } else setError(data.error);
        } catch {
            setError("Error de conexión al degradar usuario");
        } finally {
            setAccionando(null);
        }
    };

    // Render
    if (!initialized) return <p>Cargando usuario...</p>;
    if (!usuario) return <AlertMessage type="error" message={error} />;

    return (
        <main style={{ maxWidth: "800px", margin: "50px auto" }}>
            <h1>Sección Administrativa</h1>

            {error && <AlertMessage type="error" message={error} />}
            {success && <AlertMessage type="success" message={success} />}

            <h2>Usuarios</h2>

            {loadingUsuarios ? (
                <p>Cargando usuarios...</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((u) => (
                            <tr key={u.id}>
                                <td>{u.nombre}</td>
                                <td>{u.email}</td>
                                <td>{u.rol}</td>
                                <td>
                                    {u.rol === "USUARIO" ? (
                                        <button
                                            onClick={() => promover(u.id)}
                                            disabled={accionando === u.id}
                                        >
                                            {accionando === u.id ? "Procesando..." : "Hacer Admin"}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => degradar(u.id)}
                                            disabled={accionando === u.id}
                                        >
                                            {accionando === u.id ? "Procesando..." : "Hacer Usuario"}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <p>Nota: No puedes cambiar tu propio rol.</p>
        </main>
    );
}
