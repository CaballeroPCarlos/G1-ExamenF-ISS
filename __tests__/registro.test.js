import { POST } from "@/app/api/registro/route";
import prisma from "@/lib/prisma";
import argon2 from "argon2";

// Mock prisma
jest.mock("@/lib/prisma", () => ({
    usuario: {
        findUnique: jest.fn(),
        create: jest.fn()
    }
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
    info: jest.fn(),
    error: jest.fn()
}));

describe("POST /api/registro", () => {

    test("Debe rechazar datos inválidos (Zod)", async () => {
        const req = {
            json: async () => ({
                nombre: "Ca", // muy corto
                email: "mal", // inválido
                password: "12" // corto
            })
        };

        const res = await POST(req);
        expect(res.status).toBe(400);
        expect(res.json.ok).toBe(false);
    });

    test("Debe detectar correo ya registrado", async () => {
        prisma.usuario.findUnique.mockResolvedValue({ id: 1 });

        const req = {
            json: async () => ({
                nombre: "Carlos",
                email: "test@test.com",
                password: "123456"
            })
        };

        const res = await POST(req);
        expect(res.status).toBe(400);
        expect(res.json.error).toContain("ya está registrado");
    });

    test("Debe registrar correctamente un nuevo usuario", async () => {
        prisma.usuario.findUnique.mockResolvedValue(null);
        prisma.usuario.create.mockResolvedValue({
            id: 1,
            nombre: "Carlos",
            email: "test@test.com",
            rol: "USUARIO"
        });

        jest.spyOn(argon2, "hash").mockResolvedValue("hashed-password");

        const req = {
            json: async () => ({
                nombre: "Carlos",
                email: "test@test.com",
                password: "123456"
            })
        };

        const res = await POST(req);
        expect(res.status).toBe(201);
        expect(res.json.usuario.email).toBe("test@test.com");
    });

});
