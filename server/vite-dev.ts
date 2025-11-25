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

  // Use Vite's middleware first to handle all Vite-specific requests
  app.use(vite.middlewares);

  // Handle SPA routes - serve index.html for all non-API routes
  app.get('*', async (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    try {
      const url = req.originalUrl;
      // The original code snippet had 'indexHtml' which was not defined in this scope.
      // It should be read from the file system like in the original code.
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
}