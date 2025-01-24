import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Se ha producido un error:", err);
  const statusCode = err.status || 500;
  // return res.status(statusCode).json({
  //   message: err.message || "Error interno del servidor",
  //   error: err,
  // });
};
