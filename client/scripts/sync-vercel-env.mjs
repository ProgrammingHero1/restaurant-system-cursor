import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.join(__dirname, "..");
const scope = "jhankarpheros-projects";
const targets = ["production", "preview", "development"];
const productionUrl =
  process.env.VERCEL_PRODUCTION_URL ||
  "https://client-jhankarpheros-projects.vercel.app";

function parseEnvFile(filePath) {
  const vars = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    vars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return vars;
}

const vars = parseEnvFile(path.join(clientRoot, ".env.local"));
vars.BETTER_AUTH_URL = productionUrl;
vars.NEXT_PUBLIC_APP_URL = productionUrl;

let failed = false;

for (const [key, value] of Object.entries(vars)) {
  for (const target of targets) {
    const result = spawnSync(
      "vercel",
      ["env", "add", key, target, "--scope", scope, "--force"],
      {
        input: value,
        cwd: clientRoot,
        encoding: "utf8",
        shell: process.platform === "win32",
      },
    );
    if (result.error) {
      console.error(`Failed ${key} (${target}):`, result.error.message);
      failed = true;
    } else if (result.status !== 0) {
      console.error(`Failed ${key} (${target}):`, result.stderr || result.stdout);
      failed = true;
    } else {
      console.log(`Synced ${key} (${target})`);
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("All environment variables synced.");
