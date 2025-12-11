"use client";

export default function Modal({ isOpen, onClose, onSubmit, children }) {
    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}
            onClick={onClose} // Cerrar al hacer clic fuera del modal
        >
            <div
                style={{
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "8px",
                    minWidth: "300px",
                    maxWidth: "90%",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                }}
                onClick={(e) => e.stopPropagation()} // Evita cerrar al hacer clic dentro
            >
                <div>{children}</div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                        marginTop: "15px",
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            background: "#f5f5f5",
                            cursor: "pointer",
                            transition: "background 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#e0e0e0")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={onSubmit} // Asegúrate de pasar usuario.id o datos desde la página
                        style={{
                            padding: "8px 16px",
                            borderRadius: "4px",
                            border: "none",
                            background: "#0070f3",
                            color: "#fff",
                            cursor: "pointer",
                            transition: "background 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#005bb5")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#0070f3")}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}
