import "@testing-library/jest-dom";

// Mock mínimo de NextResponse para pruebas de API
jest.mock("next/server", () => ({
    NextResponse: {
        json: (data, init = {}) => ({
            json: data,
            status: init.status ?? 200,
            ok: (init.status ?? 200) >= 200 && (init.status ?? 200) < 300
        })
    }
}));
