import express from 'express'
import { ApiError, ErrorTypeEnum } from '../errors/api.error'
import multer from 'multer'
import { MIME_TYPES } from '../db/models/media.model'
import expressBasicAuth from 'express-basic-auth'
import { apiUserService } from '../services/apiUser.service'

export const asyncMiddleware =
  (fn: express.RequestHandler) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }

export const mediaMiddleware = multer({
  limits: {
    files: 1,
    fileSize: 1024 * 1024 * 100 // 100 MB
  },
  fileFilter(req, file, cb) {
    // Reject files with disallowed mime types
    cb(null, MIME_TYPES.has(file.mimetype))
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
      case ErrorTypeEnum.invalidType: {
        res.status(400)
        message = apiError.clientMessage || 'Invalid parameter(s) type(s).'
        break
      }
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
    console.error(err)
    res.status(500)
    res.send({ message: 'Internal server error.' })
  }
}

const myAuthorizer = async (username: string, password: string, cb: any) => {
  const valid = await apiUserService.validatePassword(username, password)
  return cb(null, valid)
}

export const authMiddleware = expressBasicAuth({
  authorizer: myAuthorizer,
  authorizeAsync: true,
  unauthorizedResponse: (req: any) => ({
    error: req.auth ? 'Provided credentials are incorrect' : 'No credentials provided'
  })
})
