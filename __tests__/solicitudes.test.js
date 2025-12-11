import { GET, POST, PUT, DELETE } from "@/app/api/solicitudes/route";
import prisma from "@/lib/prisma";

// Mock prisma
jest.mock("@/lib/prisma", () => ({
    usuario: {
        findUnique: jest.fn()
    },
    solicitud: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    }
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
    info: jest.fn(),
    error: jest.fn()
}));

describe("/api/solicitudes", () => {

    // -------------------- GET --------------------
    test("GET debe devolver solo las solicitudes del usuario si no es admin", async () => {
        prisma.usuario.findUnique.mockResolvedValue({
            id: 1,
            rol: "USUARIO",
            email: "user@test.com"
        });

        prisma.solicitud.findMany.mockResolvedValue([{ id: 1, titulo: "A" }]);

        const req = { url: "https://x.com?usuarioId=1" };

        const res = await GET(req);
        expect(res.status).toBe(200);
        expect(res.json.solicitudes.length).toBe(1);
    });

    // -------------------- POST --------------------
    test("POST debe crear solicitud válida", async () => {
        prisma.solicitud.create.mockResolvedValue({
            id: 10,
            titulo: "Prueba",
            descripcion: "Desc",
            usuarioId: 1
        });

        const req = {
            json: async () => ({
                titulo: "Prueba",
                descripcion: "Descripcion correcta",
                usuarioId: 1
            })
        };

        const res = await POST(req);
        expect(res.status).toBe(201);
        expect(res.json.solicitud.id).toBe(10);
    });

    // -------------------- PUT --------------------
    test("PUT debe actualizar estado si usuario es admin", async () => {
        prisma.usuario.findUnique.mockResolvedValue({
            id: 1,
            rol: "ADMIN",
            email: "admin@test.com"
        });

        prisma.solicitud.update.mockResolvedValue({
            id: 5,
            estado: "APROBADO"
        });

        const req = {
            json: async () => ({
                id: 5,
                estado: "APROBADO",
                usuarioId: 1
            })
        };

        const res = await PUT(req);
        expect(res.status).toBe(200);
        expect(res.json.solicitud.estado).toBe("APROBADO");
    });

});
