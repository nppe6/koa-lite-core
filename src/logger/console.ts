import log4js, { Appender, Layout, Logger } from 'log4js'

// log4js 内置的日志等级映射。
// 当前项目主要通过 configureLogger 里的 level 控制最低输出等级，
// 这里保留 levels 是为了后续如果需要手动设置 logger.level，可以直接复用。
export const levels = {
  trace: log4js.levels.TRACE,
  debug: log4js.levels.DEBUG,
  info: log4js.levels.INFO,
  warn: log4js.levels.WARN,
  error: log4js.levels.ERROR,
  fatal: log4js.levels.FATAL
}

// 创建统一的日志输出格式。
// %d：时间
// %p：日志等级
// %z：进程 id
// %c：logger 分类名称
// %m：日志正文
export const createLoggerLayout = (): Layout => ({
  type: 'pattern',
  pattern: '%d %p %z --- %c - %m'
})

// 创建标准输出 appender。
// appender 可以理解为“日志输出到哪里”，这里表示输出到终端控制台的 stdout。
const createStdoutAppender = (): Appender => ({
  type: 'console',
  layout: createLoggerLayout()
})

// 创建标准错误输出 appender。
// 用于把 ERROR/FATAL 级别的日志输出到 stderr，对齐旧项目 ConsoleTransport 的行为。
const createStderrAppender = (): Appender => ({
  type: 'stderr',
  layout: createLoggerLayout()
})

// 创建控制台相关 appender。
// stdoutConsole 只接收 TRACE 到 WARN，stderrConsole 只接收 ERROR 到 FATAL，
// 避免 ERROR/FATAL 同时出现在 stdout 和 stderr 中。
export const createConsoleAppenders = (): Record<string, Appender> => ({
  stdout: createStdoutAppender(),
  stderr: createStderrAppender(),
  stdoutConsole: {
    type: 'logLevelFilter',
    appender: 'stdout',
    level: 'TRACE',
    maxLevel: 'WARN'
  },
  stderrConsole: {
    type: 'logLevelFilter',
    appender: 'stderr',
    level: 'ERROR',
    maxLevel: 'FATAL'
  }
})

// 把 log4js 的 Logger 实例包装成项目内部统一使用的 logger 对象。
// 这样外部可以直接使用 ctx.logger.info / warn / error 等方法，
// 不需要关心底层使用的是 log4js。
export const createLoggerMethods = (log: Logger) => ({
  trace: (...content: any[]) => write(log.trace.bind(log), content),
  debug: (...content: any[]) => write(log.debug.bind(log), content),
  info: (...content: any[]) => write(log.info.bind(log), content),
  warn: (...content: any[]) => write(log.warn.bind(log), content),
  error: (...content: any[]) => write(log.error.bind(log), content),
  fatal: (...content: any[]) => write(log.fatal.bind(log), content)
})

// 获取默认分类的 logger。
// 如果不传分类名称，会使用 log4js.configure 中 categories.default 的配置。
export const getLogger = () => log4js.getLogger()

// 暴露 log4js 的 configure 方法，供 extend/logging.ts 根据项目配置初始化日志。
export const configureLogger = log4js.configure

// 关闭 log4js。
// 一般用于应用退出、测试收尾或需要确保文件日志完全写入磁盘的场景。
export const shutdownLogger = (callback?: (error?: Error) => void) => {
  log4js.shutdown(callback)
}

// 统一转发日志内容。
// 这里把第一个参数作为主消息，其余参数继续透传给 log4js，
// 因此可以支持 ctx.logger.info('message', extraData) 这种多参数写法。
function write(fn: (message: any, ...args: any[]) => void, content: any[]) {
  const [message = '', ...args] = content
  fn(message, ...args)
}
