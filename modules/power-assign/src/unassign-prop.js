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
export function unassignProp<T: Restorable>(obj: T, propName: DotNotationString): T {
  const propNames = propName.split('.')

  const lastPropName = propNames.pop()

  const lastObjPropName = propNames.join('.')
  const lastObj = getNestedValue(obj, lastObjPropName)

  const copiedLastObj = Object.assign({}, lastObj)
  delete copiedLastObj[lastPropName]

  return assign(obj, { $set: { [lastObjPropName]: copiedLastObj } })
}
