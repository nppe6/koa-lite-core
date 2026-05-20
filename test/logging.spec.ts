import type Application from 'koa'
import { config } from '../src/config'
import { logger, logging } from '../src/extend/logging'

describe('pino logging extension', () => {
  test('registers pino middleware and keeps ctx.logger compatibility', async () => {
    const middleware: Array<(ctx: any, next: () => Promise<void>) => Promise<void>> = []
    const app = {
      use(fn: any) {
        middleware.push(fn)
        return this
      }
    } as unknown as Application

    logging(app)

    expect(middleware).toHaveLength(2)

    const log = { info: jest.fn() }
    const next = jest.fn().mockResolvedValue(undefined)
    const ctx: any = { log }

    await middleware[1](ctx, next)

    expect(ctx.logger).toBe(log)
    expect(next).toHaveBeenCalledTimes(1)
  })

  test('reads log config when logging is registered', () => {
    const middleware: any[] = []
    const app = {
      use(fn: any) {
        middleware.push(fn)
        return this
      }
    } as unknown as Application

    config.setItem('log.level', 'debug')
    logging(app)

    expect(logger.level).toBe('debug')

    config.setItem('log.level', 'info')
  })
})
