import { rmSync, mkdirSync, cpSync, existsSync } from "fs";

// Remove public/docs if it exists
if (existsSync("public/docs")) {
  rmSync("public/docs", { recursive: true, force: true });
}

// Recreate it
mkdirSync("public/docs", { recursive: true });

// Copy docs/dist → public/docs
cpSync("docs/dist", "public/docs", { recursive: true });
