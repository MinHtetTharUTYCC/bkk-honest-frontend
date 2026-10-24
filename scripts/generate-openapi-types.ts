import { spawnSync } from "node:child_process";

const defaultSource = "http://localhost:3000/api-json";
const source = process.env.OPENAPI_SCHEMA_SOURCE ?? process.env.OPENAPI_SCHEMA_URL ?? defaultSource;
const outputPath = "src/types/api.d.ts";

if (process.env.CI === "true" && source.includes("localhost")) {
  console.error("[openapi:types] Refusing localhost OpenAPI source in CI.");
  console.error("Set OPENAPI_SCHEMA_SOURCE (or OPENAPI_SCHEMA_URL) to a deterministic URL or file path.");
  process.exit(1);
}

console.log(`[openapi:types] Generating types from: ${source}`);

const command = "pnpm";
const args = ["exec", "openapi-typescript", source, "-o", outputPath];
const result = spawnSync(command, args, {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error("[openapi:types] Failed to run openapi-typescript:", result.error.message);
  process.exit(1);
}

if (typeof result.status === "number" && result.status !== 0) {
  process.exit(result.status);
}

console.log(`[openapi:types] Wrote ${outputPath}`);
