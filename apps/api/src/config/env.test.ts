import { describe, expect, it } from "vitest";

import { parseApiEnvironment } from "./env";

const validEnvironment = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: "4000",
  LOG_LEVEL: "silent",
  MONGODB_URI: "mongodb://127.0.0.1:27017/?replicaSet=rs0",
  MONGODB_DB_NAME: "zuridesk_test",
  WEB_ORIGINS: "http://localhost:3000,http://localhost:8081"
};

describe("API environment", () => {
  it("parses validated server-only configuration", () => {
    expect(parseApiEnvironment(validEnvironment)).toMatchObject({
      API_PORT: 4000,
      WEB_ORIGINS: ["http://localhost:3000", "http://localhost:8081"]
    });
  });

  it("fails closed when the MongoDB URI is missing", () => {
    const invalidEnvironment: NodeJS.ProcessEnv = { ...validEnvironment };
    delete invalidEnvironment.MONGODB_URI;
    expect(() => parseApiEnvironment(invalidEnvironment)).toThrow();
  });
});
