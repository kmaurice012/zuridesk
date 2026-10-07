import createClient from "openapi-fetch";

import type { paths } from "./generated/schema";

export function createZuriDeskApiClient(baseUrl: string) {
  return createClient<paths>({ baseUrl });
}

export type { paths as ZuriDeskApiPaths } from "./generated/schema";
