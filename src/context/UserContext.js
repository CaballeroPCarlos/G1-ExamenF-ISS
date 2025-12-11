"use client";

import { createContext, useState, useEffect } from "react";

export const UserContext = createContext({
    usuario: null,
    setUsuario: () => { }
});

export function UserProvider({ children }) {
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const stored = sessionStorage.getItem("usuario");
        if (stored) setUsuario(JSON.parse(stored));
    }, []);

    return (
        <UserContext.Provider value={{ usuario, setUsuario }}>
            {children}
        </UserContext.Provider>
    );
}
