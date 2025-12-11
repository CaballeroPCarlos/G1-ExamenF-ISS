import { PrismaClient } from "@prisma/client";

let prisma;

// Usar una instancia global para evitar múltiples conexiones en desarrollo
if (!global.prisma) {
    global.prisma = new PrismaClient({
        log: ["query", "info", "warn", "error"], // útil para debug
    });

    // Escuchar errores de Prisma
    global.prisma.$on("error", (e) => {
        console.error("Prisma Client Error:", e);
    });
}

prisma = global.prisma;

export default prisma;
