import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

/**
 * Validar que el usuario que realiza la acción sea un ADMIN
 */
async function getAdminUserFromBody(body) {
    const adminId = Number(body.usuarioId);
    if (!adminId) throw new Error("No autenticado");

    const admin = await prisma.usuario.findUnique({ where: { id: adminId } });
    if (!admin || admin.rol !== "ADMIN") throw new Error("Acceso denegado");

    return admin;
}

/**
 * GET: listar usuarios excepto el admin actual
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const adminId = Number(searchParams.get("usuarioId"));
        if (!adminId) throw new Error("No autenticado");

        const admin = await prisma.usuario.findUnique({ where: { id: adminId } });
        if (!admin || admin.rol !== "ADMIN") throw new Error("Acceso denegado");

        const usuarios = await prisma.usuario.findMany({
            where: { NOT: { id: admin.id } },
            select: { id: true, nombre: true, email: true, rol: true }
        });

        return NextResponse.json({ ok: true, usuarios });
    } catch (err) {
        logger.error("Error GET /api/admin: %s", err.message);
        return NextResponse.json({ ok: false, error: err.message }, { status: 403 });
    }
}

/**
 * PUT: promover a ADMIN
 */
export async function PUT(req) {
    try {
        const body = await req.json();
        const admin = await getAdminUserFromBody(body);

        const target = Number(body.id);
        if (!target) throw new Error("ID inválido");
        if (target === admin.id) throw new Error("No puedes modificar tu propio rol");

        const usuario = await prisma.usuario.findUnique({ where: { id: target } });
        if (!usuario) throw new Error("Usuario no encontrado");

        if (usuario.rol === "ADMIN") throw new Error("El usuario ya es ADMIN");

        const actualizado = await prisma.usuario.update({
            where: { id: target },
            data: { rol: "ADMIN" }
        });

        logger.info(
            "ADMIN %s promovió a %s a ADMIN",
            admin.email,
            actualizado.email
        );

        return NextResponse.json({ ok: true, usuario: actualizado });
    } catch (err) {
        logger.error("Error PUT /api/admin: %s", err.message);
        return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
}

/**
 * PATCH: degradar a USUARIO
 */
export async function PATCH(req) {
    try {
        const body = await req.json();
        const admin = await getAdminUserFromBody(body);

        const target = Number(body.id);
        if (!target) throw new Error("ID inválido");
        if (target === admin.id) throw new Error("No puedes modificar tu propio rol");

        const usuario = await prisma.usuario.findUnique({ where: { id: target } });
        if (!usuario) throw new Error("Usuario no encontrado");

        if (usuario.rol === "USUARIO") throw new Error("El usuario ya es USUARIO");

        const actualizado = await prisma.usuario.update({
            where: { id: target },
            data: { rol: "USUARIO" }
        });

        logger.info(
            "ADMIN %s degradó a %s a USUARIO",
            admin.email,
            actualizado.email
        );

        return NextResponse.json({ ok: true, usuario: actualizado });
    } catch (err) {
        logger.error("Error PATCH /api/admin: %s", err.message);
        return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
}
