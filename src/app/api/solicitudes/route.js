import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { z } from "zod";

/* -------------------- VALIDACIONES -------------------- */
const crearSchema = z.object({
    titulo: z.string().min(3, "El título es demasiado corto."),
    descripcion: z.string().min(5, "La descripción es demasiado corta."),
    usuarioId: z.number().int().positive("ID de usuario inválido."),
});

const actualizarSchema = z.object({
    id: z.number().int().positive(),
    estado: z.enum(["PENDIENTE", "APROBADO", "RECHAZADO"]),
    usuarioId: z.number().int().positive("ID del usuario inválido."),
});

/* -------------------- GET - LISTAR -------------------- */
/**
 * Lógica correcta:
 *  - Si el usuario que consulta es ADMIN → devolver TODAS las solicitudes
 *  - Si no es ADMIN → devolver SOLO las propias
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const usuarioId = Number(searchParams.get("usuarioId"));

        if (!usuarioId)
            return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });

        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
        });

        if (!usuario)
            return NextResponse.json({ ok: false, error: "Usuario no encontrado" }, { status: 404 });

        const isAdmin = usuario.rol === "ADMIN";

        const solicitudes = isAdmin
            ? await prisma.solicitud.findMany({ include: { usuario: true } })
            : await prisma.solicitud.findMany({
                where: { usuarioId },
                include: { usuario: true },
            });

        logger.info("Solicitudes listadas correctamente por %s (%s)", usuario.email, usuario.rol);

        return NextResponse.json({ ok: true, solicitudes }, { status: 200 });
    } catch (err) {
        logger.error(`Error en GET solicitudes: ${err.message}`);
        return NextResponse.json({ ok: false, error: "Error al obtener solicitudes." }, { status: 500 });
    }
}

/* -------------------- POST - CREAR SOLICITUD -------------------- */
export async function POST(req) {
    try {
        const body = await req.json();
        const data = crearSchema.parse(body);

        const solicitud = await prisma.solicitud.create({
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion,
                usuarioId: data.usuarioId,
            },
        });

        logger.info(`Solicitud creada por el usuario ${data.usuarioId}`);

        return NextResponse.json({ ok: true, solicitud }, { status: 201 });
    } catch (err) {
        logger.error(`Error en POST solicitudes: ${err.message}`);

        if (err.name === "ZodError") {
            return NextResponse.json(
                { ok: false, error: err.errors.map((e) => e.message).join(", ") },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { ok: false, error: "Error al crear la solicitud." },
            { status: 400 }
        );
    }
}

/* -------------------- PUT - ACTUALIZAR ESTADO (solo ADMIN) -------------------- */
export async function PUT(req) {
    try {
        const body = await req.json();
        const data = actualizarSchema.parse(body);

        const usuario = await prisma.usuario.findUnique({
            where: { id: data.usuarioId },
        });

        if (!usuario || usuario.rol !== "ADMIN") {
            return NextResponse.json(
                { ok: false, error: "Solo administradores pueden actualizar solicitudes." },
                { status: 403 }
            );
        }

        const solicitud = await prisma.solicitud.update({
            where: { id: data.id },
            data: { estado: data.estado },
        });

        logger.info(
            `ADMIN ${usuario.email} actualizó solicitud ${data.id} → ${data.estado}`
        );

        return NextResponse.json({ ok: true, solicitud }, { status: 200 });
    } catch (err) {
        logger.error(`Error en PUT solicitudes: ${err.message}`);

        if (err.name === "ZodError") {
            return NextResponse.json(
                { ok: false, error: err.errors.map((e) => e.message).join(", ") },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { ok: false, error: "Error al actualizar la solicitud." },
            { status: 400 }
        );
    }
}

/* -------------------- DELETE - ELIMINAR SOLICITUD (solo ADMIN) -------------------- */
export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = Number(searchParams.get("id"));
        const usuarioId = Number(searchParams.get("usuarioId"));

        if (!id) {
            return NextResponse.json({ ok: false, error: "ID de solicitud inválido." }, { status: 400 });
        }

        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
        });

        if (!usuario || usuario.rol !== "ADMIN") {
            return NextResponse.json(
                { ok: false, error: "Solo administradores pueden eliminar solicitudes." },
                { status: 403 }
            );
        }

        await prisma.solicitud.delete({ where: { id } });

        logger.info(`ADMIN ${usuario.email} eliminó la solicitud ${id}`);

        return NextResponse.json({ ok: true, mensaje: "Solicitud eliminada." }, { status: 200 });
    } catch (err) {
        logger.error(`Error en DELETE solicitudes: ${err.message}`);
        return NextResponse.json({ ok: false, error: "Error al eliminar la solicitud." }, { status: 500 });
    }
}
