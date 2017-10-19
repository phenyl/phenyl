// @flow
import deepEqual from 'fast-deep-equal'

export default function isRestorable(obj: any): boolean {
  if (obj == null || typeof obj != 'object' || obj.constructor === Object) {
    return true
  }

  const plain = JSON.parse(JSON.stringify(obj))

  const newObj = new obj.constructor(plain)
  return deepEqual(obj, newObj)
}
