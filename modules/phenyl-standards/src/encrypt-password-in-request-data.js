// @flow
import type {
  EntityDefinition,
  RequestData,
  Session,
  ResponseData,
  CoreExecution,
  DocumentPath,
} from 'phenyl-interfaces'

import type {
  EncryptFunction,
} from '../decls/index.js.flow'

import { getNestedValue } from 'phenyl-utils'

import { assign } from 'power-assign'


export function encryptPasswordInRequestData(reqData: RequestData, passwordPropName: DocumentPath, encrypt: EncryptFunction): RequestData {
  let reqDataWithEncryptedPass

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

      const operators = reqData.payload.operation

      let operatorsWithEncryptedPass = operators

      Object.keys(operators).forEach(key => {
        const password = getNestedValue(operators[key], passwordPropName)

        if (password) {
          operatorsWithEncryptedPass = assign(operatorsWithEncryptedPass, { $set: { [`${key}.${passwordPropName}`]: encrypt(password) } })
        }
      })

      return assign(reqData, { $set: { 'payload.operators': operatorsWithEncryptedPass }})
    }
    default:
      return reqData
  }
}
