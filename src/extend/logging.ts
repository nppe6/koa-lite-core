import Application from 'koa'
import { config } from '../config'
import {
  configureLogger,
  createConsoleAppenders,
  createFileAppender,
  createLoggerMethods,
  getLogger
} from '../logger'

// 默认配置
let options = {
  level: 'INFO',
  dir: 'logs',
  sizeLimit: 1024 * 1024 * 5,
  file: true
}
const logConf = config.getItem('log')

// 融合配置
options = { ...options, ...logConf }

const appenders = {
  // 控制台输出。无论是否开启文件日志，控制台日志都会启用。
  // stdoutConsole 负责 TRACE-WARN，stderrConsole 负责 ERROR-FATAL。
  ...createConsoleAppenders(),
  ...(options.file
    ? {
        // 文件输出。只有 options.file 为 true 时才创建，避免关闭文件日志时仍构造文件 appender。
        file: createFileAppender({
          dir: options.dir,
          sizeLimit: options.sizeLimit
        })
      }
    : {})
}

// 配置 log4js。
// appenders 定义“日志可以写到哪里”，categories 定义“某类日志实际写到哪些 appender”。
configureLogger({
  appenders,
  categories: {
    // default 是 log4js.getLogger() 不传 category 时使用的默认分类。
    default: {
      // 对齐源项目的 file 开关：
      // file: true  -> 控制台 + 文件
      // file: false -> 仅控制台
      appenders: options.file
        ? ['stdoutConsole', 'stderrConsole', 'file']
        : ['stdoutConsole', 'stderrConsole'],

      // 最低输出等级，例如 INFO 表示 DEBUG/TRACE 不会输出。
      level: options.level
    }
  }
})

// 获取 log4js 默认 logger，并包装成项目习惯的 logger 对象。
// 外部可以继续使用 ctx.logger.info / warn / debug / error。
export const logger = createLoggerMethods(getLogger())

/**
 * ATTENTION: 需第一时间主动加载配置，然后将 logging 扩展第一时间挂载到 ctx 原型上
 * 日志扩展
 *
 * ```ts
 * ctx.logger.info('request handled')
 * ctx.logger.warn('request warning')
 * ctx.logger.debug('request debug')
 * ctx.logger.error(error)
 * ```
 */
export const logging = (app: Application) => {
  app.context.logger = logger
}
