import fs from 'fs'
import path from 'path'
import { unset } from 'lodash'

/**
 * Assertion utility.
 */
export function assert(ok: boolean, ...args: string[]): void {
  if (!ok) {
    throw new Error(args.join(' '))
  }
}

// 批量删除对象中的属性
export function unsets(obj: any, props: Array<string>) {
  props.forEach((prop) => {
    unset(obj, prop)
  })
}

// 下划线转换驼峰
export function toHump(name: string) {
  return name.replace(/\_(\w)/g, (_, letter) => {
    return letter.toUpperCase()
  })
}

// 驼峰转换下划线
export function toLine(name: string) {
  return name.replace(/([A-Z])/g, '_$1').toLowerCase()
}

/**
 * 获取文件夹下所有文件名
 * @param dir 文件夹
 */
export function getFiles(dir: string) {
  let res: string[] = []
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const name = dir + '/' + file
    if (fs.statSync(name).isDirectory()) {
      const tmp = getFiles(name)
      res = res.concat(tmp)
    } else {
      res.push(name)
    }
  }
  return res
}

/**
 * 递归创建目录 同步方法
 * @param dirname 目录
 */
export function mkdirsSync(dirname: string) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}
