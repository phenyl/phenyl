// @flow

import type {
  DotNotationString,
  UpdateOperator,
  UpdateOperators,
} from 'phenyl-interfaces'

export function retargetToProp(ops: UpdateOperators, propName: DotNotationString): UpdateOperators {

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
