import {
  hasOwnNestedProperty,
  // @ts-ignore remove this comment after @phenyl/oad-utils released
} from 'oad-utils'

import {
  visitEntitiesInResponseData,
  // @ts-ignore remove this comment after @phenyl/utils released
} from '@phenyl/utils'

import {
  assign,
  // @ts-ignore remove this comment after @phenyl/power-assign released
} from 'power-assign'

import {
  ResponseData,
  Entity,
  // @ts-ignore remove this comment after @phenyl/interfaces released
} from '@phenyl/interfaces'

export function removePasswordFromResponseData<M extends string | number | symbol>(resData: ResponseData, passwordPropName: M): ResponseData {
  return visitEntitiesInResponseData(resData, (entity: Entity) => {
    if (!hasOwnNestedProperty(entity, passwordPropName)) return entity
    return assign(entity, { $unset: { [passwordPropName]: '' } })
  })
}
