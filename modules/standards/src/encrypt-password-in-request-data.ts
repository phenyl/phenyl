import {
  GeneralRequestData,
} from '@phenyl/interfaces'

import { $bind, update } from "@sp2/updater"
import { DocumentPath, getNestedValue } from '@sp2/format'

import {
  EncryptFunction,
} from '../decls/index'


export function encryptPasswordInRequestData(reqData: GeneralRequestData, passwordPropName: DocumentPath, encrypt: EncryptFunction): GeneralRequestData {
  switch (reqData.method) {
    case 'insertOne':
    case 'insertMulti':
    case 'insertAndGet':
    case 'insertAndGetMulti': {
      const { payload } = reqData
      // @ts-ignore TODO: differ Multi Type and Single Type
      const { value, values } = payload

      if (values) {
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
      } else if (value) {
        const password = getNestedValue(value, passwordPropName)

        if (password) {
          const { $set, $docPath } = $bind<typeof value>()
          const valueWithEncryptedPass = update(value, $set($docPath(passwordPropName), encrypt(password)))
          const { $set: $OtherSet, $docPath: $otherDocPath } = $bind<typeof reqData>() 
          return update(reqData, $OtherSet($otherDocPath("payload", "value"), valueWithEncryptedPass))
        } else {
          return reqData
        }
      } else {
        return reqData
      }
    }
    case 'updateById':
    case 'updateMulti':
    case 'updateAndGet':
    case 'updateAndFetch': {

      const { operation } = reqData.payload

      let operationWithEncryptedPass = operation

      Object.keys(operation).forEach((key: any) => {
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
