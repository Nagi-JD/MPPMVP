import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mobileRoot = join(__dirname, "..");
const previewHtmlPath = join(mobileRoot, "preview", "index.html");
const expoPort = 8081;
const previewPort = 3100;

if (!existsSync(previewHtmlPath)) {
  console.error("Fichier introuvable:", previewHtmlPath);
  process.exit(1);
}

const previewHtmlTemplate = readFileSync(previewHtmlPath, "utf8");

const previewServer = createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    const html = previewHtmlTemplate.replaceAll(
      "http://localhost:8081",
      `http://localhost:${expoPort}`,
    );
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

previewServer.listen(previewPort, () => {
  console.log("");
  console.log("  Aperçu mobile (dans Cursor, pas un navigateur externe)");
  console.log("  ───────────────────────────────────────────────────");
  console.log(`  1. Ctrl+Shift+P → « Simple Browser: Show »`);
  console.log(`  2. URL : http://localhost:${previewPort}`);
  console.log("");
  console.log(`  Expo Web : http://localhost:${expoPort}`);
  console.log("  Fast Refresh actif — modifiez le code et regardez l’onglet.");
  console.log("");
});

const expo = spawn("npx expo start --web --port " + expoPort, {
  cwd: mobileRoot,
  shell: true,
  stdio: "inherit",
  env: { ...process.env, EXPO_NO_TELEMETRY: "1" },
});

function shutdown() {
  previewServer.close();
  if (!expo.killed) {
    expo.kill("SIGTERM");
  }
}

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});

expo.on("exit", (code) => {
  previewServer.close();
  process.exit(code ?? 0);
});
