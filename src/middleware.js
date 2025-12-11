import { NextResponse } from "next/server";

// Middleware simplificado sin JWT
export async function middleware(req) {
    const response = NextResponse.next();

    // -------------------- Cabeceras de seguridad HTTP --------------------
    response.headers.set("X-DNS-Prefetch-Control", "off");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    return response;
}

// Aplica middleware solo a rutas bajo /api/solicitudes
export const config = {
    matcher: ["/api/solicitudes/:path*"],
};
