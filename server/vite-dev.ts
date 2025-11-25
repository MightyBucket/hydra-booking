import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";
import { createServer as createViteServer, createLogger } from "vite";
import viteConfig from "../vite.config";

export async function setupVite(app: Express, server: Server) {
  const viteLogger = createLogger();

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  // Handle SPA routes BEFORE Vite middleware to prevent Vite from treating routes as file paths
  app.get('*', async (req, res, next) => {
    const url = req.originalUrl;
    
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // Skip actual file requests (assets, scripts, etc.)
    if (req.path.includes('.') && !req.path.endsWith('.html')) {
      return next();
    }

    try {
      const clientTemplatePath = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );
      let indexHtml = await fs.promises.readFile(clientTemplatePath, "utf-8");
      const template = await vite.transformIndexHtml(url, indexHtml);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  // Use Vite's middleware after SPA routing for asset handling
  app.use(vite.middlewares);
}