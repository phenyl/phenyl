// @flow

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
