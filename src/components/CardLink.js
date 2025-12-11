"use client";

import { useState } from "react";

export default function CardLink({ href, title, description }) {
    const [hover, setHover] = useState(false);

    return (
        <a
            href={href}
            className="card-link"
            style={{
                display: "block",
                padding: "20px",
                margin: "10px 0",
                border: "1px solid #ccc",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#333",
                transform: hover ? "translateY(-3px)" : "translateY(0)",
                boxShadow: hover ? "0 4px 10px rgba(0,0,0,0.1)" : "none",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            role="link"
        >
            <h3 style={{ margin: "0 0 10px 0" }}>{title}</h3>
            {description && <p style={{ margin: 0, color: "#555" }}>{description}</p>}
        </a>
    );
}
