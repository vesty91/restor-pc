import { z } from "zod";
import { nonEmptyIdSchema } from "./common";

export const licenseStatusSchema = z.enum(["active", "revoked", "expired"]);

export const licensesListQuerySchema = z.object({
  q: z.string().trim().max(64).optional().default(""),
  status: z
    .union([licenseStatusSchema, z.literal("")])
    .optional()
    .default(""),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const createLicenseSchema = z.object({
  script_id: z.string().trim().min(1, "script_id requis.").max(80),
  note: z.string().trim().max(500).optional().default(""),
  max_machines: z.number().int().min(0).max(100).optional().default(1),
  status: licenseStatusSchema.optional().default("active"),
  license_key: z.string().trim().max(64).optional(),
});

export const patchLicenseSchema = z
  .object({
    id: nonEmptyIdSchema.max(64),
    status: licenseStatusSchema.optional(),
    note: z.string().trim().max(500).optional(),
    max_machines: z.number().int().min(0).max(100).optional(),
    script_id: z.string().trim().min(1).max(80).optional(),
    resetMachine: z.boolean().optional(),
  })
  .refine(
    (v) =>
      v.status !== undefined ||
      v.note !== undefined ||
      v.max_machines !== undefined ||
      v.script_id !== undefined ||
      v.resetMachine === true,
    { message: "Aucune modification fournie." }
  );

export const deleteLicenseSchema = z.object({
  id: nonEmptyIdSchema.max(64),
});

export type LicensesListQuery = z.infer<typeof licensesListQuerySchema>;
export type CreateLicenseInput = z.infer<typeof createLicenseSchema>;
export type PatchLicenseInput = z.infer<typeof patchLicenseSchema>;
