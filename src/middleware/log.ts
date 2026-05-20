import { HttpException, NotFound, MethodNotAllowed } from '../exception/http-exception';
import { Context } from 'koa';

/**
 * 请求异常流转中间件。
 *
 * 普通请求日志交给 koa-pino-logger 自动记录；
 * 这里只负责把异常、404、405 统一转交给全局 error handler。
 */
export const log = async (ctx: Context, next: () => Promise<any>) => {
  try {
    await next();
    if (ctx.status === 404) {
      ctx.app.emit('error', new NotFound(), ctx);
    } else if (ctx.status === 405) {
      ctx.app.emit('error', new MethodNotAllowed(), ctx);
    } else if (!ctx.body) {
      ctx.app.emit('error', new HttpException({ message: ctx.message }), ctx);
    }
  } catch (err) {
    ctx.status = ctx.status || 500;
    ctx.app.emit('error', err, ctx);
  }
};
