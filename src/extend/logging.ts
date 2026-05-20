import Application from 'koa'
import pinoLogger from 'koa-pino-logger'
import pino from 'pino'
import type { Logger } from 'pino'
import type { Options } from 'pino-http'
import { config } from '../config'

// 应用级 logger。
//
// 初始值使用普通 pino 实例，保证 logging(app) 还没有执行时也能安全记录日志。
// logging(app) 执行后会替换成 koa-pino-logger 创建的 logger，这样全局 logger
// 和请求日志中间件使用同一份 pino 配置。
export let logger: Logger = pino()

/**
 * 注册日志中间件。
 *
 * koa-pino-logger 会做两件事：
 * 1. 自动记录请求日志，除非配置 log.requestLog 为 false。
 * 2. 把请求级 logger 挂到 ctx.log，方便业务代码记录带 request 信息的日志。
 *
 * 这里额外把 ctx.log 赋给 ctx.logger，是为了兼容项目原来的 ctx.logger 调用习惯。
 */
export const logging = (app: Application) => {
  // log 配置会透传给 pino-http，只有本项目自定义的字段会在 createLoggerOptions 中转换。
  const logConf = config.getItem('log', {})
  const pinoMiddleware = pinoLogger(createLoggerOptions(logConf))

  // 对外导出的 logger 要跟中间件内部 logger 保持一致，避免应用级日志和请求日志配置不一致。
  logger = pinoMiddleware.logger

  // 先注册 koa-pino-logger，让后续中间件都能拿到 ctx.log。
  app.use(pinoMiddleware)
  app.use(async (ctx, next) => {
    // ctx.logger 是项目层面的别名；真正由 koa-pino-logger 提供的是 ctx.log。
    ctx.logger = ctx.log
    await next()
  })
}

/**
 * 把项目里的 log 配置转换成 pino-http 能识别的配置。
 *
 * level: 默认 info，并统一转成小写，避免配置里写 INFO / Warn 导致级别不匹配。
 * requestLog: 项目自定义开关；false 时关闭 koa-pino-logger 的自动请求日志。
 * 其他字段原样透传给 pino-http，例如 transport、redact、customProps 等。
 */
function createLoggerOptions(logConf: Record<string, any>): Options {
  const { level, requestLog, ...pinoOptions } = logConf

  return {
    ...pinoOptions,
    level: normalizeLevel(level, 'info'),
    autoLogging: requestLog === false ? false : pinoOptions.autoLogging
  }
}

/**
 * 标准化日志级别配置。
 */
function normalizeLevel(level: unknown, defaultLevel: string) {
  return typeof level === 'string' ? level.toLowerCase() : defaultLevel
}
