import { Express } from "express";
import { Server } from "http";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

export function log(message: string, source = "express") {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Setup for development environment with Vite
  const { createServer: createViteServer } = await import("vite");
  
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
    root: resolve("client"),
  });
  
  app.use(vite.middlewares);
  
  log("vite middleware installed");
}

export function serveStatic(app: Express) {
  // Serve static files in production
  const __dirname = fileURLToPath(new URL(".", import.meta.url));
  const staticPath = resolve(__dirname, "../client/dist");
  
  app.use(express.static(staticPath));
  
  // Serve all routes to index.html for SPA
  app.get("*", (_, res) => {
    res.sendFile(join(staticPath, "index.html"));
  });
  
  log(`static files served from ${staticPath}`);
}