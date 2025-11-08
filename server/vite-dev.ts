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

  // Use Vite's middleware first to handle module requests
  app.use(vite.middlewares);

  // Handle client-side routing AFTER Vite middleware as a fallback
  app.use(async (req, res, next) => {
    // Only handle GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip API routes
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }

    // Skip Vite internal routes
    if (req.originalUrl.startsWith('/@')) {
      return next();
    }

    // Skip requests with file extensions (except .html)
    const ext = path.extname(req.originalUrl);
    if (ext && ext !== '.html') {
      return next();
    }

    // Serve index.html for client-side routes
    try {
      const clientTemplatePath = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let indexHtml = await fs.promises.readFile(clientTemplatePath, "utf-8");
      indexHtml = await vite.transformIndexHtml(req.originalUrl, indexHtml);

      res.status(200).set({ "Content-Type": "text/html" }).end(indexHtml);
    } catch (e) {
      next(e);
    }
  });
}