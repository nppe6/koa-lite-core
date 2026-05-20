import path from 'path'
import { createFileAppenders } from '../src/logger/file'

describe('logger file appenders', () => {
  test('splits info and error logs into separate date files', () => {
    const appenders = createFileAppenders({
      dir: 'logs',
      sizeLimit: 1024
    }) as any

    expect(appenders.fileInfo.filename).toBe(path.join(process.cwd(), 'logs', 'info', '_'))
    expect(appenders.fileError.filename).toBe(path.join(process.cwd(), 'logs', 'error', '_'))
    expect(appenders.fileInfo.pattern).toBe('yyyy-MM-dd.log')
    expect(appenders.fileError.pattern).toBe('yyyy-MM-dd.log')
  })

  test('filters file logs by normal and error levels', () => {
    const appenders = createFileAppenders({
      dir: 'logs',
      sizeLimit: 1024
    }) as any

    expect(appenders.fileInfoFilter).toMatchObject({
      type: 'logLevelFilter',
      appender: 'fileInfo',
      level: 'INFO',
      maxLevel: 'WARN'
    })
    expect(appenders.fileErrorFilter).toMatchObject({
      type: 'logLevelFilter',
      appender: 'fileError',
      level: 'ERROR',
      maxLevel: 'FATAL'
    })
  })
})
