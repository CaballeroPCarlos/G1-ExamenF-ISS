import { useEffect, useState } from "react";

export default function AlertMessage({ type = "error", message, duration = 0 }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => setVisible(false), duration);
            return () => clearTimeout(timer);
        }
    }, [duration]);

    if (!message || !visible) return null;

    let backgroundColor;
    let textColor;
    let borderColor;

    switch (type) {
        case "success":
            backgroundColor = "#d4edda";
            textColor = "#155724";
            borderColor = "#c3e6cb";
            break;
        case "info":
            backgroundColor = "#cce5ff";
            textColor = "#004085";
            borderColor = "#b8daff";
            break;
        case "error":
        default:
            backgroundColor = "#f8d7da";
            textColor = "#721c24";
            borderColor = "#f5c6cb";
            break;
    }

    return (
        <div
            role="alert"
            style={{
                backgroundColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                borderRadius: "5px",
                padding: "10px 15px",
                margin: "5px 0",
            }}
        >
            {String(message)}
        </div>
    );
}
