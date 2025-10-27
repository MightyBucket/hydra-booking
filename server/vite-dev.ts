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

  app.use(vite.middlewares);

  // Fallback to index.html for client-side routing (only for non-API routes)
  app.get('*', async (req, res, next) => {
    // Skip API routes - they're handled by express routes
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }

    try {
      const url = req.originalUrl;
      const clientTemplatePath = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );
      const indexHtml = await fs.promises.readFile(clientTemplatePath, "utf-8");
      const template = await vite.transformIndexHtml(url, indexHtml);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}