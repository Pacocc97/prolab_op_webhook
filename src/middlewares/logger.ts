import morgan from "morgan";
import { Request, Response } from "express";

// Formato de log personalizado (opcional)
const format = ":method :url :status - :response-time ms";

// Exportamos el middleware
export const loggerMiddleware = morgan(format, {
  // Opciones adicionales (si quieres redirigir logs, etc.)
  stream: {
    write: (message: string) => {
      // Aquí podrías integrar con Winston o guardarlos en un archivo
      console.log(message.trim());
    },
  },
});
