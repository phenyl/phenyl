// @flow
import { normalizeOperation } from './normalize-operation.js'

import type {
  UpdateOperator,
  UpdateOperation,
  DocumentPath,
} from 'mongolike-operations'

export function retargetToProp(docPath: DocumentPath, _operation: Object): $Subtype<UpdateOperation> {

  const operation = normalizeOperation(_operation)
  const newOps: UpdateOperator = {}

  if (operation.$and) {
    // $FlowIssue(operation.$and-is-Array)
    newOps.$and = operation.$and.map(subOps => retargetToProp(docPath, subOps))
    if (operation.$restore) {
      // $FlowIssue(newOps-can-have-$restore-property)
      newOps.$restore = retargetToProp(docPath, { $restore: operation.$restore }).$restore
    }
    return newOps
  }

  const operatorNames = Object.keys(operation)

  for (const operatorName of operatorNames) {
    const operator: UpdateOperator = operation[operatorName]
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

export function retargetToPropWithRestoration(docPath: DocumentPath, _operation: Object): UpdateOperation {
  const operation = retargetToProp(docPath, _operation)

  const $restore = operation.$restore || {}
  $restore[docPath] = ''

  // here we write to the operation (mutable)
  return Object.assign(operation, { $restore })
}
