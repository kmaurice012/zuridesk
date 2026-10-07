import { afterEach, describe, expect, it, vi } from "vitest";

import { checkDatabaseHealth, disconnectDatabase } from "./connection";

describe("database connection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports down before a connection is established", async () => {
    await disconnectDatabase();
    await expect(checkDatabaseHealth()).resolves.toBe("down");
  });
});
