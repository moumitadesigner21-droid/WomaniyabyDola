import { readFileSync, existsSync } from "node:fs";
import { parseEnv } from "node:util";
import { spawn } from "node:child_process";

const base = existsSync(".dev.vars") ? parseEnv(readFileSync(".dev.vars", "utf8")) : {};
const sandbox = existsSync(".dev.vars.sandbox") ? parseEnv(readFileSync(".dev.vars.sandbox", "utf8")) : {};
if ((sandbox.CASHFREE_ENV ?? base.CASHFREE_ENV) === "production") {
  throw new Error("Local development requires sandbox keys in .dev.vars.sandbox; live payments are disabled in npm run dev.");
}
const args = process.argv.slice(2);
const portIndex = args.findIndex((a) => a === "--port" || a === "-p");
const port = portIndex >= 0 ? args[portIndex + 1] : "3000";
const child = spawn("./node_modules/.bin/next", ["dev", ...args], {
  env: { ...process.env, ...base, ...sandbox, SITE_URL: `http://localhost:${port}` }, stdio: "inherit",
});
child.on("exit", (code) => process.exit(code ?? 0));
