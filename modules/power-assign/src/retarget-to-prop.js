// @flow
import { normalizeOperators } from './normalize-operators.js'

import type {
  UpdateOperator,
  UpdateOperators,
  DocumentPath,
} from 'mongolike-operations'

export function retargetToProp(docPath: DocumentPath, _ops: Object): $Subtype<UpdateOperators> {

  const ops = normalizeOperators(_ops)
  const newOps: UpdateOperator = {}

  if (ops.$and) {
    // $FlowIssue(ops.$and-is-Array)
    newOps.$and = ops.$and.map(subOps => retargetToProp(docPath, subOps))
    if (ops.$restore) {
      // $FlowIssue(newOps-can-have-$restore-property)
      newOps.$restore = retargetToProp(docPath, { $restore: ops.$restore }).$restore
    }
    return newOps
  }

  const operatorNames = Object.keys(ops)

  for (const operatorName of operatorNames) {
    const operator: UpdateOperator = ops[operatorName]
      // $FlowIssue(newOps-can-have-property-of-operatorName)
    newOps[operatorName] = {}
    Object.keys(operator).forEach(originalDocPath => {
      const newDocPath = [docPath, originalDocPath].join('.')
      // $FlowIssue(newOps-can-have-new-property)
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
