import {
  healthLiveResponseSchema,
  healthReadyResponseSchema
} from "@zuridesk/shared/contracts/health";
import type { FastifyPluginCallback } from "fastify";

export interface HealthRoutesOptions {
  checkDatabase: () => Promise<"up" | "down">;
}

export const healthRoutes: FastifyPluginCallback<HealthRoutesOptions> = (app, options, done) => {
  app.get(
    "/live",
    {
      schema: {
        tags: ["operations"],
        summary: "Process liveness",
        response: {
          200: healthLiveResponseSchema
        }
      }
    },
    (request) => ({
      status: "ok" as const,
      service: "zuridesk-api" as const,
      timestamp: new Date().toISOString(),
      requestId: request.id
    })
  );

  app.get(
    "/ready",
    {
      schema: {
        tags: ["operations"],
        summary: "Required dependency readiness",
        response: {
          200: healthReadyResponseSchema,
          503: healthReadyResponseSchema
        }
      }
    },
    async (request, reply) => {
      const mongodb = await options.checkDatabase();
      const ready = mongodb === "up";
      const response = {
        status: ready ? ("ok" as const) : ("not_ready" as const),
        service: "zuridesk-api" as const,
        timestamp: new Date().toISOString(),
        requestId: request.id,
        dependencies: { mongodb }
      };

      return ready ? response : reply.code(503).send(response);
    }
  );

  done();
};
