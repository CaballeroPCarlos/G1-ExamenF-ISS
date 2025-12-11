import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import argon2 from "argon2";
import logger from "@/lib/logger";

// Validación de entrada
const schema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    email: z.string().email("El correo no es válido."),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export async function POST(req) {
    try {
        const body = await req.json();

        // Validación con Zod
        const data = schema.parse(body);

        // Verificar si el correo ya está registrado
        const existe = await prisma.usuario.findUnique({
            where: { email: data.email },
        });

        if (existe) {
            return NextResponse.json(
                { ok: false, error: "El correo ya está registrado." },
                { status: 400 }
            );
        }

        // Hash seguro de la contraseña
        const hashedPassword = await argon2.hash(data.password);

        // Crear nuevo usuario con rol "USUARIO"
        const usuario = await prisma.usuario.create({
            data: {
                nombre: data.nombre,
                email: data.email,
                password: hashedPassword,
                rol: "USUARIO",
            },
        });

        logger.info(`Nuevo registro: ${usuario.email}`);

        // Retornar usuario creado sin token
        return NextResponse.json(
            {
                ok: true,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol,
                },
            },
            { status: 201 }
        );

    } catch (err) {
        logger.error(`Error en api/registro: ${err.message}`);

        // Manejo de errores de validación de Zod
        if (err.name === "ZodError") {
            return NextResponse.json(
                { ok: false, error: err.issues.map(e => e.message).join(", ") },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { ok: false, error: "Error al registrar el usuario." },
            { status: 500 }
        );
    }
}
