"use client";

import { useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";

export default function Header() {
    const { usuario, setUsuario } = useContext(UserContext);
    const router = useRouter();

    const handleLogout = () => {
        sessionStorage.removeItem("usuario");
        setUsuario(null); // Esto actualiza automáticamente Header y otros componentes
        router.push("/login");
    };

    return (
        <header
            style={{
                padding: "10px 20px",
                backgroundColor: "#1976d2",
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
        >
            <h1
                style={{ fontSize: "1.2rem", margin: 0, cursor: "pointer" }}
                onClick={() => router.push("/")}
            >
                Colegio Santa María - Módulo Seguro
            </h1>

            <nav>
                {usuario ? (
                    <>
                        <Link href="/solicitudes" style={{ marginRight: "15px", color: "#fff" }}>
                            Solicitudes
                        </Link>
                        {usuario.rol === "ADMIN" && (
                            <Link href="/admin" style={{ marginRight: "15px", color: "#fff" }}>
                                Admin
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                margin: 0,
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: "1rem",
                            }}
                        >
                            Salir
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" style={{ marginRight: "15px", color: "#fff" }}>
                            Login
                        </Link>
                        <Link href="/registro" style={{ color: "#fff" }}>
                            Registro
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
}
