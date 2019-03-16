import {
  hasOwnNestedProperty,
} from '@sp2/format'

import {
  visitEntitiesInResponseData,
} from '@phenyl/utils'

import { $bind, update } from '@sp2/updater'

import {
  GeneralResponseData,
  ProEntity,
} from '@phenyl/interfaces'

export function removePasswordFromResponseData(resData: GeneralResponseData, passwordPropName: string): GeneralResponseData {
  return visitEntitiesInResponseData(resData, (entity: ProEntity): any => {
    if (!hasOwnNestedProperty(entity, passwordPropName)) return entity
    const { $unset, $docPath } = $bind<typeof entity>()
    return update(entity, $unset($docPath(passwordPropName), ''))
  })
}
