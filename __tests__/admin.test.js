import { GET, PUT, PATCH } from "@/app/api/admin/route";
import prisma from "@/lib/prisma";

// Mock prisma
jest.mock("@/lib/prisma", () => ({
    usuario: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn()
    }
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
    info: jest.fn(),
    error: jest.fn()
}));

describe("/api/admin", () => {

    // -------------------- GET --------------------
    test("GET debe rechazar usuario no admin", async () => {
        prisma.usuario.findUnique.mockResolvedValue({ id: 2, rol: "USUARIO" });

        const req = {
            url: "https://x.com?usuarioId=2"
        };

        const res = await GET(req);
        expect(res.status).toBe(403);
        expect(res.json.ok).toBe(false);
    });

    test("GET debe listar usuarios si el que consulta es admin", async () => {
        prisma.usuario.findUnique.mockResolvedValue({ id: 1, rol: "ADMIN" });

        prisma.usuario.findMany.mockResolvedValue([
            { id: 2, nombre: "Ana" }
        ]);

        const req = {
            url: "https://x.com?usuarioId=1"
        };

        const res = await GET(req);
        expect(res.status).toBe(200);
        expect(res.json.usuarios.length).toBe(1);
    });

    // -------------------- PUT --------------------
    test("PUT debe promover a ADMIN", async () => {
        prisma.usuario.findUnique
            .mockResolvedValueOnce({ id: 1, rol: "ADMIN" }) // admin
            .mockResolvedValueOnce({ id: 2, rol: "USUARIO" }); // target

        prisma.usuario.update.mockResolvedValue({
            id: 2,
            email: "nuevo@admin.com",
            rol: "ADMIN"
        });

        const req = {
            json: async () => ({
                usuarioId: 1,
                id: 2
            })
        };

        const res = await PUT(req);
        expect(res.status).toBe(200);
        expect(res.json.usuario.rol).toBe("ADMIN");
    });

    // -------------------- PATCH --------------------
    test("PATCH debe degradar a USUARIO", async () => {
        prisma.usuario.findUnique
            .mockResolvedValueOnce({ id: 1, rol: "ADMIN" }) // admin
            .mockResolvedValueOnce({ id: 2, rol: "ADMIN" }); // target

        prisma.usuario.update.mockResolvedValue({
            id: 2,
            rol: "USUARIO"
        });

        const req = {
            json: async () => ({
                usuarioId: 1,
                id: 2
            })
        };

        const res = await PATCH(req);
        expect(res.status).toBe(200);
        expect(res.json.usuario.rol).toBe("USUARIO");
    });

});
