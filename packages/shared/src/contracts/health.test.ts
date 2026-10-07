import { describe, expect, it } from "vitest";

import { healthLiveResponseSchema, healthReadyResponseSchema } from "./health";

const base = {
  service: "zuridesk-api" as const,
  timestamp: "2026-10-05T08:00:00.000Z",
  requestId: "request-1"
};

describe("health contracts", () => {
  it("accepts a liveness response", () => {
    expect(healthLiveResponseSchema.parse({ ...base, status: "ok" })).toEqual({
      ...base,
      status: "ok"
    });
  });

  it("accepts an unavailable dependency without exposing an error", () => {
    expect(
      healthReadyResponseSchema.parse({
        ...base,
        status: "not_ready",
        dependencies: { mongodb: "down" }
      })
    ).toMatchObject({ status: "not_ready", dependencies: { mongodb: "down" } });
  });
});
