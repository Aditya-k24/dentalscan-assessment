import { z } from "zod";

export const createMessageSchema = z.object({
  scanId: z.string().min(1),
  patientId: z.string().min(1),
  clinicId: z.string().min(1),
  sender: z.enum(["patient", "dentist"]),
  content: z.string().min(1, "Message cannot be empty").max(1000),
});

export const getMessagesSchema = z
  .object({
    scanId: z.string().min(1).optional(),
    threadId: z.string().min(1).optional(),
  })
  .refine((d) => d.scanId || d.threadId, {
    message: "Either scanId or threadId must be provided",
  });

export type CreateMessageRequest = z.infer<typeof createMessageSchema>;
