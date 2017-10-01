// @flow

import type {
  UpdateOperator,
  UpdateOperators,
  DocumentPath,
} from 'phenyl-interfaces'

export function retargetToProp(docPath: DocumentPath, _ops: Object): UpdateOperators {

  const firstKey = Object.keys(_ops)[0]
  if (!firstKey) return {}

  const ops = (firstKey.charAt(0) !== '$') ? { $set: _ops } : _ops

  const newOps = {}

  const operatorNames = Object.keys(ops)

  for (const operatorName of operatorNames) {
    const operator: UpdateOperator = ops[operatorName]
    newOps[operatorName] = {}
    Object.keys(operator).forEach(originalDocPath => {
      const newDocPath = [docPath, originalDocPath].join('.')
      newOps[operatorName][newDocPath] = operator[originalDocPath]
    })
  }
  return newOps
}

export function retargetToPropWithRestoration(docPath: DocumentPath, _ops: Object): UpdateOperators {
  const ops = retargetToProp(docPath, _ops)

  const $restore = ops.$restore || {}
  $restore[docPath] = ''

  // here we write to the ops (mutable)
  return Object.assign(ops, { $restore })
}
