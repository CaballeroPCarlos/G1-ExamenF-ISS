"use client";

export default function InputField({
    label,
    type = "text",
    value,
    onChange,
    required = false,
    name,
    style = {},
}) {
    const baseStyle = {
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        fontSize: "14px",
        boxSizing: "border-box",
        outline: "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    };

    const handleFocus = (e) => {
        e.target.style.borderColor = "#0070f3";
        e.target.style.boxShadow = "0 0 0 2px rgba(0, 112, 243, 0.2)";
    };

    const handleBlur = (e) => {
        e.target.style.borderColor = "#ccc";
        e.target.style.boxShadow = "none";
    };

    return (
        <div style={{ marginBottom: "15px", ...style }}>
            <label
                style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}
                aria-label={label}
            >
                {label}
                {required && " *"}
            </label>

            {type === "textarea" ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    style={baseStyle}
                    rows={4}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
            ) : (
                <input
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    required={required}
                    style={baseStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
            )}
        </div>
    );
}
