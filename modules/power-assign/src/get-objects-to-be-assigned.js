// @flow

import type {
  DotNotationString,
  Restorable,
} from 'phenyl-interfaces'

export function getObjectsToBeAssigned(obj: Restorable, propName: DotNotationString): Array<Restorable> {
  const ret = [obj]
  const keys = propName.split('.')
  keys.pop()
  let currentObj = obj
  for (const key of keys) {
    currentObj = currentObj[key]
    ret.push(currentObj)
  }
  return ret
}
