"use client";

import { useEffect, useState } from "react";

import CardLink from "@/components/CardLink";
import AlertMessage from "@/components/AlertMessage";

import styles from "@/styles/page.module.css";

export default function Home() {
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Intentar obtener usuario desde sessionStorage
    const storedUser = sessionStorage.getItem("usuario");

    if (!storedUser) {
      setError("No autenticado. Redirigiendo a login...");
      setTimeout(() => (window.location.href = "/login"), 1500);
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUsuario(parsedUser);
    } catch (err) {
      console.error("Error al leer usuario:", err);
      setError("Error al procesar usuario. Redirigiendo a login...");
      setTimeout(() => (window.location.href = "/login"), 1500);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Cargando...</p>;
  }
  if (!usuario) {
    return <AlertMessage type="error" message={error || "No autenticado"} />;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Bienvenido, {usuario.nombre}!</h1>
        <p>
          Tu rol: <strong>{usuario.rol}</strong>
        </p>

        <div className={styles.links}>
          <CardLink
            href="/solicitudes"
            title="Gestionar Solicitudes"
            description="Crear, actualizar y eliminar solicitudes."
          />

          {usuario.rol === "ADMIN" && (
            <CardLink
              href="/admin"
              title="Sección Administrativa"
              description="Accede a funciones de administración."
            />
          )}
        </div>
      </main>
    </div>
  );
}
