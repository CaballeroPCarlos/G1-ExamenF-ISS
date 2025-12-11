import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function POST() {
    try {
        logger.info("Logout simulado (sin JWT ni cookies)");

        // Simplemente respondemos que se cerró la sesión
        return NextResponse.json({ ok: true, message: "Sesión cerrada" }, { status: 200 });
    } catch (err) {
        logger.error(`Error en logout: ${err.message}`);
        return NextResponse.json(
            { ok: false, error: "Error al cerrar la sesión." },
            { status: 500 }
        );
    }
}
