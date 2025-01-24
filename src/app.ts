import express, { Application } from "express";
import cors from "cors";
import { config } from "./config";
import { loggerMiddleware } from "./middlewares/logger";
import { errorHandler } from "./middlewares/errorHandler";
import router from "./routes/index.routes";

export function createApp(): Application {
  const app = express();

  // CORS
  const corsOptions = {
    // origin: config.allowedOrigins,
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  };
  app.use(
    cors()
    // corsOptions
  );

  // Logs
  app.use(loggerMiddleware);

  // Parse JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rutas
  app.use("/", router);

  // Middleware de errores (al final)
  app.use(errorHandler);

  return app;
}
