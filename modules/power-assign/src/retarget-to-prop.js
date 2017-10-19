// @flow
import { normalizeOperation } from './normalize-operation.js'

import type {
  UpdateOperator,
  UpdateOperation,
  DocumentPath,
} from 'mongolike-operations'

export function retargetToProp(docPath: DocumentPath, _ops: Object): $Subtype<UpdateOperation> {

  const ops = normalizeOperation(_ops)
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

export function retargetToPropWithRestoration(docPath: DocumentPath, _ops: Object): UpdateOperation {
  const ops = retargetToProp(docPath, _ops)

  const $restore = ops.$restore || {}
  $restore[docPath] = ''

  // here we write to the ops (mutable)
  return Object.assign(ops, { $restore })
}
