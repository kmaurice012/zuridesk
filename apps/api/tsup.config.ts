import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/server.ts"],
  external: ["mongoose"],
  format: ["esm"],
  noExternal: [/^@zuridesk\//u],
  outDir: "dist",
  platform: "node",
  target: "node24"
});
