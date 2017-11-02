// @flow
import {
  getNestedValue
} from './get-nested-value.js'

import type {
  UpdateOperator,
  SetOperator,
  UpdateOperatorName,
  RegularUpdateOperation,
} from 'mongolike-operations'

/**
 *
 */
export function getInversedOperation(obj: Object, op: RegularUpdateOperation): RegularUpdateOperation {
    const inversedOp = {}
    let $set = {}
    const operatorNames: Array<UpdateOperatorName> = Object.keys(op)

    for (const operatorName of operatorNames) {
      switch (operatorName) {

        case '$inc': {
          inversedOp.$inc = Object.keys(op.$inc).reduce((ret, docPath) => {
            const val = op.$inc[docPath]
            ret[docPath] = -val
            return ret
          }, {})
          break
        }
        case '$set': {
          $set = Object.assign($set, getCurrentValues(obj, op.$set))
          break
        }
        case '$min': {
          $set = Object.assign($set, getCurrentValues(obj, op.$min))
          break
        }
        case '$max': {
          $set = Object.assign($set, getCurrentValues(obj, op.$max))
          break
        }
        case '$mul': {
          $set = Object.assign($set, getCurrentValues(obj, op.$mul))
          break
        }
        case '$addToSet': {
          inversedOp.$pull = op.$addToSet
          break
        }
        case '$pop': {
          inversedOp.$push = Object.keys(op.$pop).reduce((ret, docPath) => {
            const modifier = { $each: [] }
            const direction = op.$pop[docPath]
            const arr = getNestedValue(obj, docPath)
            if (!Array.isArray(arr)) {
              throw new Error(`"$pop" operator must be applied to an array. Dot notation: "${docPath}".`)
            }
            const val = (direction === 1) ? arr[arr.length - 1] : arr[0]
            ret[docPath] = { $each: [val] }
            return ret
          }, {})
          break
        }

        case '$pull': {
          updatedObj = this.$pull(updatedObj, uOp.$pull)
          break
        }

        case '$push':
          updatedObj = this.$push(updatedObj, uOp.$push)
          break

        case '$currentDate':
          updatedObj = this.$currentDate(updatedObj, uOp.$currentDate)
          break

        case '$bit':
          updatedObj = this.$bit(updatedObj, uOp.$bit)
          break

        case '$unset':
          updatedObj = this.$unset(updatedObj, uOp.$unset)
          break

        case '$rename':
          updatedObj = this.$rename(updatedObj, uOp.$rename)
          break

        case '$restore':
          // this operation must run at the end of all other opreations
          break

        case '$setOnInsert':
          throw new Error(`The given operator "${operatorName}" is not implemented yet.`)

        default:
          throw new Error(`Invalid operator: "${operatorName}"`)
      }
    }
}

function getCurrentValues(obj: Object, operator: UpdateOperator): SetOperator {
  return Object.keys(operator).reduce(($set, docPath) => {
    const val = getNestedValue(obj, docPath)
    $set[docPath] = -val
    return $set
  }, {})
}
