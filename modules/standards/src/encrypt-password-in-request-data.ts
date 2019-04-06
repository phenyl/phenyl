import {
  GeneralRequestData,
} from '@phenyl/interfaces'

import { 
  $bind,
  update,
  DocumentPath,
  getNestedValue
} from "sp2"

import { EncryptFunction } from './decls'

export function encryptPasswordInRequestData(reqData: GeneralRequestData, passwordPropName: DocumentPath, encrypt: EncryptFunction): GeneralRequestData {
  switch (reqData.method) {
    case 'insertOne':
    case 'insertAndGet': {
      const { payload } = reqData
      const { value } = payload
      const password = getNestedValue(value, passwordPropName)

      if (password) {
        const { $set, $docPath } = $bind<typeof value>()
        const valueWithEncryptedPass = update(value, $set($docPath(passwordPropName), encrypt(password)))
        const { $set: $OtherSet, $docPath: $otherDocPath } = $bind<typeof reqData>() 
        return update(reqData, $OtherSet($otherDocPath("payload", "value"), valueWithEncryptedPass))
      } else {
        return reqData
      }
    }
    case 'insertMulti':
    case 'insertAndGetMulti': {
      const { payload } = reqData
      const { values } = payload

      const valuesWithEncryptedPass = values.map(value => {
        const password = getNestedValue(value, passwordPropName)

        if (password) {
          const { $set, $docPath } = $bind<typeof value>()
          return update(value, $set($docPath(passwordPropName), encrypt(password)))
        } else {
          return value
        }
      })
      const { $set, $docPath } = $bind<typeof reqData>()
      return update(reqData, $set($docPath('payload', 'values'), valuesWithEncryptedPass))
    }
    case 'updateById':
    case 'updateMulti':
    case 'updateAndGet':
    case 'updateAndFetch': {

      const { operation } = reqData.payload

      let operationWithEncryptedPass = operation

      Object.keys(operation).forEach((key: any) => {
        // @ts-ignore: Partial<UpdateOperationMap> has no index signature.
        const password = getNestedValue(operation[key], passwordPropName)

        if (password) {
          const { $set, $docPath } = $bind<typeof operationWithEncryptedPass>()
          operationWithEncryptedPass = update(operationWithEncryptedPass, $set($docPath(key, passwordPropName), encrypt(password)))
        }
      })

      const { $set, $docPath } = $bind<typeof reqData>()
      return update(reqData, $set($docPath('payload', 'operation'), operationWithEncryptedPass))
    }
    case 'push':
      // TODO Implement to encrypt password in push command
      return reqData

    default:
      return reqData
  }
}
