import { POST } from "@/app/api/login/route";
import prisma from "@/lib/prisma";
import argon2 from "argon2";

// Mock prisma
jest.mock("@/lib/prisma", () => ({
    usuario: {
        findUnique: jest.fn()
    }
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));

describe("POST /api/login", () => {

    test("Debe rechazar credenciales vacías", async () => {
        const req = {
            json: async () => ({
                email: "",
                password: ""
            })
        };
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    test("Debe rechazar credenciales incorrectas", async () => {
        prisma.usuario.findUnique.mockResolvedValue(null);

        const req = {
            json: async () => ({
                email: "x@x.com",
                password: "1234"
            })
        };

        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    test("Debe aceptar login correcto", async () => {
        prisma.usuario.findUnique.mockResolvedValue({
            id: 1,
            email: "test@test.com",
            nombre: "Carlos",
            rol: "USUARIO",
            password: "hash"
        });

        // Mock hash
        jest.spyOn(argon2, "verify").mockResolvedValue(true);

        const req = {
            json: async () => ({
                email: "test@test.com",
                password: "123456"
            })
        };

        const res = await POST(req);
        expect(res.status).toBe(200);
        expect(res.json.usuario.email).toBe("test@test.com");
    });
});
