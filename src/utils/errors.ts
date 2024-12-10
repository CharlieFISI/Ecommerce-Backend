import { Prisma } from '@prisma/client'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor (message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor (resource: string) {
    super(`${resource} not found`, 404)
  }
}

export class ValidationError extends AppError {
  constructor (message: string) {
    super(message, 400)
  }
}

export class AuthorizationError extends AppError {
  constructor (message: string = 'Not authorized') {
    super(message, 403)
  }
}

export class DatabaseError extends AppError {
  constructor (message: string) {
    super(message, 500)
  }
}

export class ConfigError extends AppError {
  constructor (message: string) {
    super(message, 500)
  }
}

export function isPrismaError (error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError
}
