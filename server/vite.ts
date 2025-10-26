import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { createServer as createViteServer } from "vite";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server, basePath?: string) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("setupVite should only be called in development mode");
  }
  // Import the dev setup only in development
  const { setupVite: setupViteDev } = await import("./vite-dev.js");

  const vite = await createViteServer({
    configFile: path.resolve(process.cwd(), "vite.config.ts"),
    base: basePath || '/',
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
  });
  return setupViteDev(app, server, vite);
}

export function serveStatic(app: Express, basePath?: string) {
  const distPath = path.resolve(process.cwd(), "dist/public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  const staticPath = basePath || '/';
  app.use(staticPath, express.static(distPath));

  app.get(`${basePath}*`, (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}