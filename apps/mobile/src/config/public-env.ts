import { z } from "zod";

const publicEnvironmentSchema = z.object({
  EXPO_PUBLIC_API_URL: z.url()
});

export function getPublicEnvironment() {
  return publicEnvironmentSchema.parse({
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL
  });
}
