"use client";

import { useState } from "react";
import InputField from "@/components/InputField";
import AlertMessage from "@/components/AlertMessage";
import { useRouter } from "next/navigation";

export default function RegistroPage() {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        // Validación básica frontend
        if (nombre.trim().length < 3) {
            setError("El nombre debe tener al menos 3 caracteres.");
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("El correo no es válido.");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, email, password }),
            });

            const data = await res.json();

            if (!data.ok) {
                setError(data.error || "Error al registrar usuario");
            } else {
                setSuccess("Usuario registrado correctamente. Redirigiendo al login...");
                setNombre("");
                setEmail("");
                setPassword("");

                // Redirigir al login
                setTimeout(() => router.push("/login"), 1500);
            }
        } catch (err) {
            console.error("Registro error:", err);
            setError("Error en la conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ maxWidth: "400px", margin: "50px auto", padding: "0 20px" }}>
            <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Registro de Usuario</h1>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <InputField
                    label="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
                <InputField
                    label="Correo"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <InputField
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <AlertMessage type="error" message={error} />}
                {success && <AlertMessage type="success" message={success} />}

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
                    {loading ? "Registrando..." : "Registrar"}
                </button>
            </form>
        </main>
    );
}
