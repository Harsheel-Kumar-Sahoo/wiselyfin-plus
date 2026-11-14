import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Sends any error thrown inside an async route to the error handler below.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({
    ok: false,
    error: { code: "NOT_FOUND", message: "This address does not exist." },
  });
}

// Every failure leaves the server in the same friendly shape. Details stay in the server log.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.status).json({ ok: false, error: { code: err.code, message: err.message } });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      ok: false,
      error: {
        code: "INVALID_INPUT",
        message: "Please check the details you entered.",
        fields: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      },
    });
    return;
  }
  console.error("Unexpected error:", err instanceof Error ? err.message : "unknown");
  res.status(500).json({
    ok: false,
    error: { code: "SERVER_ERROR", message: "Something went wrong on our side. Please try again." },
  });
}