// @flow

import type {
  DotNotationString,
  Restorable,
} from 'phenyl-interfaces'

export function getNestedValue(obj: Restorable, dnStr: DotNotationString): any {
  return dnStr.split('.').reduce((currentObj, key) => currentObj[key], obj)
}
