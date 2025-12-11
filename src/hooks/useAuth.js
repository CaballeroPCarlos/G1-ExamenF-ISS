"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook de autenticación simple (sin JWT)
 * @param {string|null} requiredRole - Rol necesario para acceder a la página ("USUARIO" | "ADMIN")
 */
export default function useAuth(requiredRole = null) {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    // -------------------------
    // Inicializar usuario desde sessionStorage
    // -------------------------
    useEffect(() => {
        const storedUser = sessionStorage.getItem("usuario");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);

            // Verificar rol si se requiere
            if (requiredRole && parsedUser.rol !== requiredRole) {
                setError("No tienes permisos para acceder a esta página");
                router.replace("/"); // Redirige al home
            } else {
                setUsuario(parsedUser);
            }
        } else if (requiredRole) {
            setError("No autenticado");
            router.replace("/login");
        }

        setLoading(false);
    }, [requiredRole, router]);

    // -------------------------
    // Función de login
    // -------------------------
    const login = (usuarioData) => {
        setUsuario(usuarioData);
        sessionStorage.setItem("usuario", JSON.stringify(usuarioData));
        setError(null);
    };

    // -------------------------
    // Función de logout
    // -------------------------
    const logout = () => {
        setUsuario(null);
        sessionStorage.removeItem("usuario");
        router.replace("/login");
    };

    return { usuario, loading, error, login, logout };
}
