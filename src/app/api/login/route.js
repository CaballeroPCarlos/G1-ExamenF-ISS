import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import argon2 from "argon2";
import logger from "@/lib/logger";

// Validación de entrada
const schema = z.object({
    email: z.string().email("El correo es inválido."),
    password: z.string().min(1, "La contraseña es obligatoria."),
});

export async function POST(req) {
    try {
        const body = await req.json();

        // Validación con Zod
        const data = schema.parse(body);

        // Buscar usuario por correo
        const usuario = await prisma.usuario.findUnique({
            where: { email: data.email },
        });

        if (!usuario) {
            logger.warn(`Intento de login con correo inexistente: ${data.email}`);
            return NextResponse.json(
                { ok: false, error: "Credenciales incorrectas." },
                { status: 401 }
            );
        }

        // Verificación del hash Argon2
        const valido = await argon2.verify(usuario.password, data.password);

        if (!valido) {
            logger.warn(`Contraseña incorrecta para: ${data.email}`);
            return NextResponse.json(
                { ok: false, error: "Credenciales incorrectas." },
                { status: 401 }
            );
        }

        // Registro del acceso exitoso
        logger.info(`Login exitoso: usuario ${usuario.email}`);

        // --------------------
        // Respuesta simplificada (sin token)
        // --------------------
        return NextResponse.json(
            {
                ok: true,
                usuario: {
                    id: usuario.id,
                    email: usuario.email,
                    nombre: usuario.nombre,
                    rol: usuario.rol,
                },
            },
            { status: 200 }
        );

    } catch (err) {
        logger.error(`Error en login: ${err.message}`);

        // Validación Zod
        if (err.name === "ZodError") {
            return NextResponse.json(
                { ok: false, error: err.issues.map(e => e.message).join(", ") },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { ok: false, error: "Error interno al procesar la solicitud." },
            { status: 500 }
        );
    }
}
