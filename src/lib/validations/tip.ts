import { z } from "zod";

export const tipSchema = z.object({
  title: z.string()
    .min(3, "Headline must be at least 3 characters")
    .max(100, "Headline cannot exceed 100 characters"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters"),
  type: z.enum(["TRY", "AVOID"]),
});

export type TipFormValues = z.infer<typeof tipSchema>;
