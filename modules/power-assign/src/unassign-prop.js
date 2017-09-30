// @flow
import {
  getNestedValue,
} from 'phenyl-utils/jsnext'

import type {
  Restorable,
  DotNotationString,
} from 'phenyl-interfaces'

import { assign } from './power-assign.js'


/**
 * Delete value of the propName from obj
 */
export function unassignProp(obj: Object, propName: DotNotationString): Object {
  const propNames = propName.split('.')

  const lastPropName = propNames.pop()

  const lastObjPropName = propNames.join('.')
  const lastObj = lastObjPropName
    ? getNestedValue(obj, lastObjPropName)
    : obj

  const copiedLastObj = Object.assign({}, lastObj)
  delete copiedLastObj[lastPropName]

  return lastObjPropName
    ? assign(obj, { $set: { [lastObjPropName]: copiedLastObj } })
    : copiedLastObj
}
