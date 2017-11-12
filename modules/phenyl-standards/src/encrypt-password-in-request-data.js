// @flow
import type {
  RequestData,
  DocumentPath,
} from 'phenyl-interfaces'

import type {
  EncryptFunction,
} from '../decls/index.js.flow'

import { getNestedValue } from 'oad-utils/jsnext'

import { assign } from 'power-assign/jsnext'


export function encryptPasswordInRequestData(reqData: RequestData, passwordPropName: DocumentPath, encrypt: EncryptFunction): RequestData {
  switch (reqData.method) {
    case 'insert':
    case 'insertAndGet':
    case 'insertAndGetMulti': {
      const { payload } = reqData

      if (payload.values) {
        const valuesWithEncryptedPass = payload.values.map(value => {
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
    case 'update':
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
