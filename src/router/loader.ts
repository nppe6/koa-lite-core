import type Koa from 'koa'
import Router from '@koa/router'
import { getFiles } from '../utils'

export interface LoadRoutesOptions {
  dir: string
  debug?: boolean
}

export function loadRoutes(app: Koa, options: LoadRoutesOptions): void {
  const files = getFiles(options.dir).filter(file => /\.(js|ts)$/.test(file) && !/\.d\.ts$/.test(file))

  for (const file of files) {
    const mod = require(file)
    const exportsToCheck = mod instanceof Router ? [mod] : Object.values(mod)

    for (const item of exportsToCheck) {
      if (item instanceof Router) {
        if (options.debug) {
          console.info(`loading router from file: ${file}`)
          item.stack.forEach(layer => console.info(`loading route: ${layer.path}`))
        }

        app.use(item.routes()).use(item.allowedMethods())
      }
    }
  }
}
