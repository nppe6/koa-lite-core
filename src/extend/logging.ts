import Application from 'koa'
import pinoLogger from 'koa-pino-logger'
import pino from 'pino'
import type { Logger } from 'pino'
import type { Options } from 'pino-http'
import { config } from '../config'

// 应用级 logger。没有 ctx 时也可以使用，例如全局 error handler 中记录未知异常。
export let logger: Logger = pino()

/**
 * 日志扩展。
 *
 * koa-pino-logger 会把请求级 logger 挂到 ctx.log。
 * 这里额外保留 ctx.logger，兼容项目原来的调用习惯。
 */
export const logging = (app: Application) => {
  const logConf = config.getItem('log', {})
  const pinoMiddleware = pinoLogger(createLoggerOptions(logConf))

  logger = pinoMiddleware.logger

  app.use(pinoMiddleware)
  app.use(async (ctx, next) => {
    ctx.logger = ctx.log
    await next()
  })
}

function createLoggerOptions(logConf: Record<string, any>): Options {
  const { level, requestLog, ...pinoOptions } = logConf

  return {
    ...pinoOptions,
    level: normalizeLevel(level, 'info'),
    autoLogging: requestLog === false ? false : pinoOptions.autoLogging
  }
}

function normalizeLevel(level: unknown, defaultLevel: string) {
  return typeof level === 'string' ? level.toLowerCase() : defaultLevel
}
