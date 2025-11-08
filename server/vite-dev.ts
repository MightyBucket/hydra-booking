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

  // Handle client-side routing BEFORE Vite middleware
  app.use(async (req, res, next) => {
    // Only handle GET requests that accept HTML
    if (req.method !== 'GET') {
      return next();
    }

    // Skip API routes
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }

    // Skip Vite internal routes (HMR, module resolution, etc.)
    if (req.originalUrl.startsWith('/@')) {
      return next();
    }

    // Skip static assets (they have file extensions)
    const ext = path.extname(req.originalUrl);
    if (ext && ext !== '.html') {
      return next();
    }

    // Serve index.html for all routes that should be handled by client-side routing
    // This includes root path, student routes, and any other client-side routes
    try {
      const clientTemplatePath = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let indexHtml = await fs.promises.readFile(clientTemplatePath, "utf-8");
      // Always use "/" as the URL for transformIndexHtml to avoid path resolution issues
      indexHtml = await vite.transformIndexHtml("/", indexHtml);

      res.status(200).set({ "Content-Type": "text/html" }).end(indexHtml);
    } catch (e) {
      next(e);
    }
  });

  app.use(vite.middlewares);
}