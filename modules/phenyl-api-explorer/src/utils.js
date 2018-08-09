// @flow
import fs from 'fs'
import path from 'path'

export function shallowMap(obj: ?Object, fn: (any, string, Object) => any): Object {
  if (!obj) {
    return {}
  }

  const ret = {}
  for (let p in obj) {
    ret[p] = fn(obj[p], p, obj)
  }
  return ret
}

export const pkgDir = (name: string): ?string => {
  const dir = require.resolve.paths(name)
    .find(p => fs.existsSync(path.join(p, name, 'package.json')))
  if (!dir) {
    return null
  }

  return path.join(dir, name)
}
