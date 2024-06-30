import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["index.ts"],
  dts: true,
  target: "node18",
  format: ["cjs", "esm"],
  splitting: true,
  cjsInterop: true,
});
