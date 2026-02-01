import { z } from "zod";

export const createBandiSchema = z.object({
  bandi_name: z.string().min(2),
  bandi_type: z.number(),
  office_bandi_id: z.string(),
  gender: z.enum(["M", "F", "O"]),
  dob: z.string(),
  nationality: z.string(),
  mudda_id_1: z.optional(z.string()),
});
