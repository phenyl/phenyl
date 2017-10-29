// @flow
import {
  normalizeUpdateOperation,
} from 'oad-utils/jsnext'

import type {
  UpdateOperator,
  UpdateOperation,
  DocumentPath,
} from 'mongolike-operations'

export function retargetToProp(docPath: DocumentPath, _operation: Object): $Subtype<UpdateOperation> {

  const operation = normalizeUpdateOperation(_operation)
  const newOps: UpdateOperator = {}
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
