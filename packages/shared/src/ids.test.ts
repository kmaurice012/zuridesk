import { describe, expect, it } from "vitest";

import { objectIdSchema } from "./ids";

describe("ObjectId boundary schema", () => {
  it("accepts canonical lowercase ObjectIds", () => {
    expect(objectIdSchema.parse("507f1f77bcf86cd799439011")).toBe("507f1f77bcf86cd799439011");
  });

  it.each(["507F1F77BCF86CD799439011", "not-an-object-id", "507f1f77bcf86cd79943901"])(
    "rejects non-canonical value %s",
    (value) => {
      expect(() => objectIdSchema.parse(value)).toThrow();
    }
  );
});
