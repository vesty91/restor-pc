import { describe, expect, it } from "vitest";
import { AppError, createRequestId, jsonError } from "@/lib/errors";

describe("public errors", () => {
  it("crée un requestId UUID", () => {
    expect(createRequestId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("AppError expose un message public", () => {
    const err = new AppError({
      code: "TEST",
      publicMessage: "Erreur publique",
      message: "détail interne sensible",
      status: 400,
    });
    expect(err.publicMessage).toBe("Erreur publique");
    expect(err.code).toBe("TEST");
    expect(err.status).toBe(400);
  });

  it("jsonError renvoie code + requestId", async () => {
    const res = jsonError("X", "msg", 400, "req-1");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "msg", code: "X", requestId: "req-1" });
  });
});
