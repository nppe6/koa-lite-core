import type Application from 'koa'
import { config } from '../src/config'
import { KoaLiteCore, LiteCore, __version__ } from '../src/core'

describe('core bootstrap', () => {
  test('attaches shared config to koa context', async () => {
    const app = {
      context: {}
    } as Application
    const core = new LiteCore()

    await core.initApp(app, { baseDir: process.cwd() })

    expect(app.context.config).toBe(config)
  })

  test('keeps package-named alias and version export', () => {
    expect(KoaLiteCore).toBe(LiteCore)
    expect(__version__).toBe('0.1.0')
  })
})
