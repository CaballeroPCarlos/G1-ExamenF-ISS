"use client";

export default function SolicitudesTable({ solicitudes, rol, onUpdate, onDelete }) {
    if (!solicitudes || solicitudes.length === 0) {
        return <p>No hay solicitudes registradas.</p>;
    }

    return (
        <table
            style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Título</th>
                    <th style={thStyle}>Descripción</th>
                    <th style={thStyle}>Estado</th>
                    <th style={thStyle}>Usuario</th>
                    <th style={thStyle}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {solicitudes.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={tdStyle}>{s.id}</td>
                        <td style={tdStyle}>{s.titulo}</td>
                        <td style={tdStyle}>{s.descripcion}</td>
                        <td style={tdStyle}>{s.estado || "pendiente"}</td>
                        <td style={tdStyle}>{s.usuario?.nombre || "Desconocido"}</td>
                        <td style={tdStyle}>
                            {rol === "ADMIN" ? (
                                <>
                                    <button
                                        onClick={() => onUpdate(s)}
                                        style={updateButtonStyle}
                                    >
                                        Actualizar
                                    </button>
                                    <button
                                        onClick={() => onDelete(s.id)}
                                        style={deleteButtonStyle}
                                    >
                                        Eliminar
                                    </button>
                                </>
                            ) : (
                                <span style={{ fontStyle: "italic", color: "#666" }}>
                                    Sin permisos
                                </span>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

const thStyle = {
    padding: "8px",
    textAlign: "left",
    borderBottom: "2px solid #ccc",
    fontWeight: "bold",
};

const tdStyle = {
    padding: "8px",
    verticalAlign: "top",
};

const updateButtonStyle = {
    padding: "4px 8px",
    marginRight: "8px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#1976d2",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
};

const deleteButtonStyle = {
    padding: "4px 8px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#d32f2f",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
};
