import express from "express"
import { ApiError, ErrorTypeEnum } from "../errors/api.error";

export const asyncMiddleware =
  (fn: express.RequestHandler) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }

export const errorMiddleware = (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ApiError) {
      const apiError = err as ApiError;
      let message: string;
      switch (apiError.errorType) {
          case ErrorTypeEnum.invalidElementId: {
              res.status(404);
              message = apiError.clientMessage || "No element with such ID.";
              break;
          }
          case ErrorTypeEnum.invalidContentType: {
            res.status(400);
              message = apiError.clientMessage || "The provided Content-Type is not supported.";
              break;
            }
          default: {
              res.status(500);
              message = apiError.clientMessage || "Internal server error.";
          }
      }
      res.send({ message });
  } else {
      throw err;
  }
}