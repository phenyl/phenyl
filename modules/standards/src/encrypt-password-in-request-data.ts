import {
  RequestData,
  DocumentPath,
  // @ts-ignore remove this comment after @phenyl/interfaces release
} from '@phenyl/interfaces'

import {
  EncryptFunction,
} from '../decls/index'

// @ts-ignore remove this comment after @phenyl/oad-utils release
import { getNestedValue } from 'oad-utils'

// @ts-ignore remove this comment after @phenyl/oad-utils release
import { assign } from 'power-assign'


export function encryptPasswordInRequestData(reqData: RequestData, passwordPropName: DocumentPath, encrypt: EncryptFunction): RequestData {
  switch (reqData.method) {
    case 'insertOne':
    case 'insertMulti':
    case 'insertAndGet':
    case 'insertAndGetMulti': {
      const { payload } = reqData

      if (payload.values) {
        const valuesWithEncryptedPass = payload.values.map((value: Object) => {
          const password = getNestedValue(value, passwordPropName)

          if (password) {
            return assign(value, { $set: { [passwordPropName]: encrypt(password)} })
          } else {
            return value
          }
        })

        return assign(reqData, { $set: { 'payload.values': valuesWithEncryptedPass }})
      } else if (payload.value) {
        const password = getNestedValue(payload.value, passwordPropName)

        if (password) {
          const valueWithEncryptedPass = assign(payload.value, { $set: { [passwordPropName]: encrypt(password) } })
          return assign(reqData, { $set: { 'payload.value': valueWithEncryptedPass }})
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

      Object.keys(operation).forEach(key => {
        const password = getNestedValue(operation[key], passwordPropName)

        if (password) {
          operationWithEncryptedPass = assign(operationWithEncryptedPass, { $set: { [`${key}.${passwordPropName}`]: encrypt(password) } })
        }
      })

      return assign(reqData, { $set: { 'payload.operation': operationWithEncryptedPass }})
    }
    case 'push':
      // TODO Implement to encrypt password in push command
      return reqData

    default:
      return reqData
  }
}
