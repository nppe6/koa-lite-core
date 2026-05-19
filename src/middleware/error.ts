import type { Context, Next } from 'koa'
import { HttpError } from '../exception'

export interface ErrorHandlerOptions {
  debug?: boolean
  unknownMessage?: string
}

export function errorHandler(options: ErrorHandlerOptions = {}) {
  return async function handleError(ctx: Context, next: Next) {
    try {
      await next()
    } catch (error) {
      ctx.type = 'application/json'

      if (error instanceof HttpError) {
        ctx.status = error.status
        ctx.body = {
          code: error.code,
          message: error.message,
          request: `${ctx.method} ${ctx.url}`,
        }
        return
      }

      ctx.status = 500
      ctx.body = {
        code: 9999,
        message: options.debug && error instanceof Error
          ? error.message
          : options.unknownMessage || 'Server Error',
        request: `${ctx.method} ${ctx.url}`,
      }
    }
  }
}
