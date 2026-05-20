import path from 'path'
import type { Appender } from 'log4js'
import { config } from '../config'
import { createLoggerLayout } from './console'

const baseDir = config.getItem('baseDir', process.cwd())

export interface FileAppenderOptions {
  // 日志目录，例如 logs。支持相对路径和绝对路径。
  dir: string
  // 保留配置项，兼容旧项目的 log.sizeLimit。
  // dateFile 会按日期切割，同时通过 maxLogSize 继续支持按文件大小切割。
  sizeLimit: number
}

/**
 * 创建 log4js 的文件输出 appender。
 *
 * appender 可以理解为“日志输出目的地”。
 * 这个 appender 负责把日志写入文件，并按日期自动切割。
 */
export const createFileAppender = (
  options: FileAppenderOptions,
  subDir = ''
): Appender => ({
  type: 'dateFile',
  // 基础文件名。最终文件名会由 filename + pattern 组成。
  // 例如：logs/info/_.2026-05-20.log
  filename: path.join(resolveLogBaseDir(options.dir), subDir, '_'),
  // 按天生成日志文件。
  pattern: 'yyyy-MM-dd.log',
  // 对齐旧项目的 sizeLimit：单个日志文件超过该大小时会继续滚动切割。
  maxLogSize: options.sizeLimit,
  // 设置文件名称为 filename + pattern，并让当前日志文件也带日期。
  alwaysIncludePattern: true,
  // 保留 .log 扩展名位置。
  keepFileExt: true,
  // 使用和控制台一致的输出格式。
  layout: createLoggerLayout()
})

// 创建文件日志相关 appender。
// fileInfoFilter 负责 INFO-WARN，fileErrorFilter 负责 ERROR-FATAL。
export const createFileAppenders = (options: FileAppenderOptions): Record<string, Appender> => ({
  fileInfo: createFileAppender(options, 'info'),
  fileError: createFileAppender(options, 'error'),
  fileInfoFilter: {
    type: 'logLevelFilter',
    appender: 'fileInfo',
    level: 'INFO',
    maxLevel: 'WARN'
  },
  fileErrorFilter: {
    type: 'logLevelFilter',
    appender: 'fileError',
    level: 'ERROR',
    maxLevel: 'FATAL'
  }
})

function resolveLogBaseDir(dir: string) {
  // 对齐源项目：绝对路径直接使用，相对路径基于 baseDir 拼接。
  return path.isAbsolute(dir) ? dir : path.join(baseDir, dir)
}
