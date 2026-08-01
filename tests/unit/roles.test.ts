import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/errors";
import type { User } from "@supabase/supabase-js";

const isAtelierAuthed = vi.fn();
const getUser = vi.fn();
const maybeSingle = vi.fn();
const getSupabaseAdmin = vi.fn();

vi.mock("@/lib/atelier-auth", () => ({
  isAtelierAuthed: () => isAtelierAuthed(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: () => getUser() },
  }),
}));

vi.mock("@/lib/fulfillment/supabase", () => ({
  getSupabaseAdmin: () => getSupabaseAdmin(),
}));

function supabaseUser(id: string, email = "user@example.com"): User {
  return {
    id,
    email,
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User;
}

describe("auth roles — technician / admin separation", () => {
  beforeEach(() => {
    vi.resetModules();
    isAtelierAuthed.mockReset();
    getUser.mockReset();
    maybeSingle.mockReset();
    getSupabaseAdmin.mockReset();
    delete process.env.ATELIER_HMAC_FALLBACK;

    getSupabaseAdmin.mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () => maybeSingle(),
          }),
        }),
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  async function loadRoles() {
    return import("@/lib/auth/roles");
  }

  it("session atelier → accès technicien autorisé (fallback HMAC)", async () => {
    isAtelierAuthed.mockResolvedValue(true);
    const { requireTechnician } = await loadRoles();
    const user = await requireTechnician();
    expect(user.id).toBe("atelier-session");
    expect(getUser).not.toHaveBeenCalled();
  });

  it("session atelier → accès admin refusé", async () => {
    isAtelierAuthed.mockResolvedValue(true);
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    const { requireAdmin } = await loadRoles();
    await expect(requireAdmin()).rejects.toMatchObject({
      code: "AUTH_REQUIRED",
      status: 401,
    } satisfies Partial<AppError>);
  });

  it("session atelier + user Supabase non-admin → admin refusé", async () => {
    isAtelierAuthed.mockResolvedValue(true);
    const customer = supabaseUser("cust-1");
    getUser.mockResolvedValue({ data: { user: customer }, error: null });
    maybeSingle.mockResolvedValue({ data: { role: "customer" }, error: null });
    const { requireAdmin } = await loadRoles();
    await expect(requireAdmin()).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
  });

  it("customer → technicien refusé", async () => {
    isAtelierAuthed.mockResolvedValue(false);
    const customer = supabaseUser("cust-2");
    getUser.mockResolvedValue({ data: { user: customer }, error: null });
    maybeSingle.mockResolvedValue({ data: { role: "customer" }, error: null });
    const { requireTechnician } = await loadRoles();
    await expect(requireTechnician()).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
  });

  it("technician Supabase → opérations technicien autorisées", async () => {
    isAtelierAuthed.mockResolvedValue(false);
    const tech = supabaseUser("tech-1", "tech@example.com");
    getUser.mockResolvedValue({ data: { user: tech }, error: null });
    maybeSingle.mockResolvedValue({ data: { role: "technician" }, error: null });
    const { requireTechnician } = await loadRoles();
    await expect(requireTechnician()).resolves.toMatchObject({ id: "tech-1" });
  });

  it("technician Supabase → opérations admin refusées", async () => {
    isAtelierAuthed.mockResolvedValue(false);
    const tech = supabaseUser("tech-2");
    getUser.mockResolvedValue({ data: { user: tech }, error: null });
    maybeSingle.mockResolvedValue({ data: { role: "technician" }, error: null });
    const { requireAdmin } = await loadRoles();
    await expect(requireAdmin()).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
  });

  it("admin Supabase → autorisé", async () => {
    isAtelierAuthed.mockResolvedValue(false);
    const admin = supabaseUser("admin-1", "admin@example.com");
    getUser.mockResolvedValue({ data: { user: admin }, error: null });
    maybeSingle.mockResolvedValue({ data: { role: "admin" }, error: null });
    const { requireAdmin, requireTechnician } = await loadRoles();
    await expect(requireAdmin()).resolves.toMatchObject({ id: "admin-1" });
    await expect(requireTechnician()).resolves.toMatchObject({ id: "admin-1" });
  });

  it("absence Supabase / erreur getUserRole → refus restrictif", async () => {
    isAtelierAuthed.mockResolvedValue(false);
    const user = supabaseUser("u-err");
    getUser.mockResolvedValue({ data: { user }, error: null });
    getSupabaseAdmin.mockImplementation(() => {
      throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants");
    });
    const { requireTechnician, requireAdmin } = await loadRoles();
    await expect(requireTechnician()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(requireAdmin()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("ATELIER_HMAC_FALLBACK=false → HMAC n’ouvre plus le technicien", async () => {
    process.env.ATELIER_HMAC_FALLBACK = "false";
    isAtelierAuthed.mockResolvedValue(true);
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    const { requireTechnician, isAtelierHmacFallbackEnabled } = await loadRoles();
    expect(isAtelierHmacFallbackEnabled()).toBe(false);
    await expect(requireTechnician()).rejects.toMatchObject({
      code: "AUTH_REQUIRED",
      status: 401,
    });
  });
});
