import { z } from "zod";

declare const objectIdBrand: unique symbol;

export type ObjectIdString = string & { readonly [objectIdBrand]: "ObjectIdString" };

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-f]{24}$/, "must be a lowercase 24-character hexadecimal ObjectId")
  .transform((value) => value as ObjectIdString);
