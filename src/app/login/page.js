// src/app/login/page.js
"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/InputField";
import AlertMessage from "@/components/AlertMessage";
import { UserContext } from "@/context/UserContext";

export default function LoginPage() {
    const { setUsuario } = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!data.ok) {
                setError(data.error || "Credenciales incorrectas");
            } else {
                // Guardar usuario en contexto y sessionStorage
                sessionStorage.setItem("usuario", JSON.stringify(data.usuario));
                setUsuario(data.usuario);

                // Redirigir a solicitudes
                router.push("/solicitudes");
            }
        } catch (err) {
            console.error("Error de conexión:", err);
            setError("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ maxWidth: "400px", margin: "50px auto", padding: "0 20px" }}>
            <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Iniciar Sesión</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
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
                    {loading ? "Ingresando..." : "Ingresar"}
                </button>
            </form>
        </main>
    );
}
