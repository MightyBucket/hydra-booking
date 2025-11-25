
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

  // Handle SPA fallback routing for client-side routes
  app.use('*', async (req, res, next) => {
    // Only handle GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip API routes
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }

    // Only serve index.html for navigation requests (browser navigation)
    // Asset requests will have different Accept headers
    const acceptsHtml = req.headers.accept?.includes('text/html');
    if (!acceptsHtml) {
      return next();
    }

    const url = req.originalUrl;

    try {
      const clientTemplatePath = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let indexHtml = await fs.promises.readFile(clientTemplatePath, "utf-8");
      indexHtml = await vite.transformIndexHtml(url, indexHtml);

      res.status(200).set({ "Content-Type": "text/html" }).end(indexHtml);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
