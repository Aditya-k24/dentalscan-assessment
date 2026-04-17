import { z } from "zod";

export const scanCompletedSchema = z.object({
  scanId: z.string().min(1),
  status: z.literal("completed"),
  userId: z.string().min(1),
  title: z.string().min(1).max(120).optional(),
  message: z.string().min(1).max(500).optional(),
});

export type ScanCompletedRequest = z.infer<typeof scanCompletedSchema>;
