import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { voiceWebhookRouter } from "./routes/voiceWebhook";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use(voiceWebhookRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Ruta no encontrada." });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[error]", err);
    res.status(500).json({ error: "Error interno del servidor." });
  });

  return app;
}
