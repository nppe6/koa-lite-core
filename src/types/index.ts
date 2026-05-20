import type { Logger } from 'pino'

declare module 'koa' {
  interface ExtendableContext {
    logger: Logger
  }
}

/**
 * HttpException 类构造函数的参数接口
 */
export interface Exception {
  code?: number;
  message?: any;
}

export interface Option {
  algorithm?: string;
  saltLength?: number;
  iterations?: number;
}

export interface ObjOptions {
  prefix?: string;
  filter?: (key: any) => boolean;
}

// 多文件配置
export interface MulOpts {
  singleLimit?: number;
  totalLimit?: number;
  fileNums?: number;
  include?: string[];
  exclude?: string[];
}
export interface CodeMessage {
  getMessage: (code: number) => string;
  [propName: number]: string;
}
