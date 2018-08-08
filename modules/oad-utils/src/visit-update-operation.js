// @flow
import {
  normalizeUpdateOperation
} from './normalize-update-operation.js'

import type {
  UpdateOperation,
  UpdateOperator,
  UpdateOperatorName,
  SetOperator,
  IncOperator,
  MinOperator,
  MaxOperator,
  MulOperator,
  AddToSetOperator,
  PopOperator,
  PullOperator,
  PushOperator,
  CurrentDateOperator,
  BitOperator,
  UnsetOperator,
  RestoreOperator,
  RenameOperator,
} from 'mongolike-operations'

export type UpdateOperationVisitor = {
  operation?: (op: UpdateOperator) => UpdateOperator,
  $set?: (op: SetOperator) => SetOperator,
  $inc?: (op: IncOperator) => IncOperator,
  $min?: (op: MinOperator) => MinOperator,
  $max?: (op: MaxOperator) => MaxOperator,
  $mul?: (op: MulOperator) => MulOperator,
  $addToSet?: (op: AddToSetOperator) => AddToSetOperator,
  $pop?: (op: PopOperator) => PopOperator,
  $pull?: (op: PullOperator) => PullOperator,
  $push?: (op: PushOperator) => PushOperator,
  $currentDate?: (op: CurrentDateOperator) => CurrentDateOperator,
  $bit?: (op: BitOperator) => BitOperator,
  $unset?: (op: UnsetOperator) => UnsetOperator,
  $restore?: (op: RestoreOperator) => RestoreOperator,
  $rename?: (op: RenameOperator) => RenameOperator,
}

/**
 * @public
 * Modify FindOperation by passing visitor functions.
 */
export function visitUpdateOperation(uOp: Object, visitor: UpdateOperationVisitor): UpdateOperation {
  return [
    '$set', '$inc', '$min', '$max', '$mul',
    '$addToSet', '$pop', '$pull', '$push',
    '$currentDate','$bit', '$unset', '$restore',
    '$rename'
  ].reduce((acc, opName: UpdateOperatorName) =>
    visitOp(acc, visitor, opName)
    , normalizeUpdateOperation(uOp))
}

function visitOp<N: UpdateOperatorName>(uOp: UpdateOperation, visitor: UpdateOperationVisitor, opName: N): UpdateOperation {
  if (uOp[opName] == null) {
    return uOp
  }

  let ret = Object.assign({}, uOp)
  const generalVisitor = visitor.operation
  if (generalVisitor != null) {
    ret = Object.assign(ret, { [opName]: generalVisitor(ret[opName]) })
  }
  // $FlowIssue(compatible)
  const specificVisitor: $ElementType<UpdateOperationVisitor, N> = visitor[opName]
  if (specificVisitor != null) {
    // $FlowIssue(compatible)
    const op: $ElementType<UpdateOperation, N> = ret[opName]
    // $FlowIssue(compatible)
    ret = Object.assign(ret, { [opName]: specificVisitor(op) })
  }
  // $FlowIssue(compatible)
  return ret
}
