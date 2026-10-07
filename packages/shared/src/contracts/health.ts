import { z } from "zod";

const healthBaseSchema = z.object({
  service: z.literal("zuridesk-api"),
  timestamp: z.iso.datetime(),
  requestId: z.string().min(1)
});

export const dependencyStatusSchema = z.enum(["up", "down"]);

export const healthLiveResponseSchema = healthBaseSchema.extend({
  status: z.literal("ok")
});

export const healthReadyResponseSchema = healthBaseSchema.extend({
  status: z.enum(["ok", "not_ready"]),
  dependencies: z.object({
    mongodb: dependencyStatusSchema
  })
});

export type HealthLiveResponse = z.infer<typeof healthLiveResponseSchema>;
export type HealthReadyResponse = z.infer<typeof healthReadyResponseSchema>;
