// @flow
import { hasOwnNestedProperty } from 'oad-utils/jsnext'

import { visitEntitiesInResponseData } from 'phenyl-utils/jsnext'

import { assign } from 'power-assign/jsnext'

import type { ResponseData } from 'phenyl-interfaces'

export function removePasswordFromResponseData(
  resData: ResponseData,
  passwordPropName: string
): ResponseData {
  return visitEntitiesInResponseData(resData, entity => {
    if (!hasOwnNestedProperty(entity, passwordPropName)) return entity
    return assign(entity, { $unset: { [passwordPropName]: '' } })
  })
}
