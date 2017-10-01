// @flow

import type {
  DotNotationString,
  UpdateOperator,
  UpdateOperators,
} from 'phenyl-interfaces'

export function retargetToProp(propName: DotNotationString, _ops: Object): UpdateOperators {

  const firstKey = Object.keys(_ops)[0]
  if (!firstKey) return {}

  const ops = (firstKey.charAt(0) !== '$') ? { $set: _ops } : _ops

  const newOps = {}

  const operatorNames = Object.keys(ops)

  for (const operatorName of operatorNames) {
    const operator: UpdateOperator = ops[operatorName]
    newOps[operatorName] = {}
    Object.keys(operator).forEach(originalPropName => {
      const newPropName = [propName, originalPropName].join('.')
      newOps[operatorName][newPropName] = operator[originalPropName]
    })
  }
  return newOps
}

export function retargetToPropWithRestoration(propName: DotNotationString, _ops: Object): UpdateOperators {
  const ops = retargetToProp(propName, _ops)

  const $restore = ops.$restore || {}
  $restore[propName] = ''

  // here we write to the ops (mutable)
  return Object.assign(ops, { $restore })
}
