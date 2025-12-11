import { createLogger, format, transports } from "winston";
import fs from "fs";
import path from "path";

// Asegurar que exista la carpeta "logs"
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    transports: [
        // Logs de errores
        new transports.File({ filename: path.join(logDir, "errores.log"), level: "error" }),
        // Logs de advertencias
        new transports.File({ filename: path.join(logDir, "warn.log"), level: "warn" }),
        // Logs generales de info
        new transports.File({ filename: path.join(logDir, "app.log"), level: "info" })
    ],
});

// Añadir transporte de consola en desarrollo
if (process.env.NODE_ENV !== "production") {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.printf(({ level, message, timestamp, stack }) => {
                return stack
                    ? `[${timestamp}] ${level}: ${message} - ${stack}`
                    : `[${timestamp}] ${level}: ${message}`;
            })
        )
    }));
}

export default logger;

/*
💡 Uso con el nuevo flujo de autenticación:

// Login exitoso
logger.info(`Login exitoso: usuario ${usuario.email}`);

// Logout
logger.info(`Usuario ${usuario?.email || 'desconocido'} cerró sesión`);

// Errores generales
logger.error("Error al crear solicitud: %s", error.message);

// Advertencias
logger.warn("Intento de acceso a recurso restringido por usuario %s", usuario?.email);
*/
