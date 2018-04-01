// @flow
import {
  hasOwnNestedProperty,
} from 'oad-utils'

import {
  visitEntitiesInResponseData,
} from 'phenyl-utils'

import {
  assign,
} from 'power-assign'

import type {
  ResponseData,
} from 'phenyl-interfaces'

export function removePasswordFromResponseData(resData: ResponseData, passwordPropName: string): ResponseData {
  return visitEntitiesInResponseData(resData, entity => {
    if (!hasOwnNestedProperty(entity, passwordPropName)) return entity
    return assign(entity, { $unset: { [passwordPropName]: '' } })
  })
}
