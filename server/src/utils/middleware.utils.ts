import express from 'express'
import { ApiError, ErrorTypeEnum } from '../errors/api.error'
import multer from 'multer'
import { MIM_TYPES } from '../db/models/media.model'

export const asyncMiddleware =
  (fn: express.RequestHandler) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }

export const mediaMiddleware = multer({
  limits: {
    files: 1,
    fileSize: 1024 * 1024 * 100 // 100MB
  },
  fileFilter(req, file, cb) {
    // Reject files with disallowed mime types
    cb(null, MIM_TYPES.has(file.mimetype))
  }
})

export const errorMiddleware = (
  err: Error,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  if (err instanceof ApiError) {
    const apiError = err as ApiError
    let message: string
    switch (apiError.errorType) {
      case ErrorTypeEnum.invalidElementId: {
        res.status(404)
        message = apiError.clientMessage || 'No element with such ID.'
        break
      }
      case ErrorTypeEnum.invalidContentType: {
        res.status(501)
        message = apiError.clientMessage || 'The provided Content-Type is not supported.'
        break
      }
      default: {
        res.status(500)
        message = apiError.clientMessage || 'Internal server error.'
      }
    }
    res.send({ message })
  } else {
    throw err
  }
}