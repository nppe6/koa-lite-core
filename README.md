# koa-lite-core

A lightweight reusable core toolkit for Koa applications.

## Install

```bash
npm install koa-lite-core
```

## Usage

```ts
import Koa from 'koa'
import { json, success, errorHandler, HttpError } from 'koa-lite-core'

const app = new Koa()

json(app)
success(app)
app.use(errorHandler())

app.use(async ctx => {
  ctx.success({ message: 'ok' })
})
```

## Publish Shape

Source TypeScript files live in `src/`.
Build output is written to `dist/`.
Only `dist/`, `README.md`, and `LICENSE` are published.
