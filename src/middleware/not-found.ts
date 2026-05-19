import type { Context, Next } from 'koa'
import { NotFound } from '../exception'

export function notFoundHandler() {
  return async function handleNotFound(ctx: Context, next: Next) {
    await next()

    if (ctx.status === 404 && !ctx.body) {
      throw new NotFound('Resource Not Found')
    }
  }
}
