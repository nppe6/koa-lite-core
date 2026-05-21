import Application from 'koa'
import { config } from './config'
import { assert } from './utils'

export const __version__ = '0.1.0'

/**
 * kernel 类.
 */
export class Kernel {
  private app?: Application

    /**
   * 初始化
   * @param app koa app
   */
  public async initApp(app: Application) {
    assert(!!app, 'app must not be null')

    this.app = app
    this.app.context.config = config
  }
}

