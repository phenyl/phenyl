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

import { assign, assignToProp } from 'power-assign'


export function encryptPasswordInRequestData(reqData: RequestData, passwordPropName: DocumentPath, encrypt: EncryptFunction): RequestData {
  let reqDataWithEncryptedPass

  switch (reqData.method) {
    case 'insert':
    case 'insertAndGet':
    case 'insertAndGetMulti': {
      const { payload } = reqData

      if (payload.values) {
        const valuesWithEncryptedPass = payload.values.slice()

        valuesWithEncryptedPass.map(value => {
          const encryptedPass = encrypt(getNestedValue(value, passwordPropName))
          return assign(value, { $set: { [passwordPropName]: encryptedPass } })
        })

        reqDataWithEncryptedPass =
          assign(reqData, { $set: { 'payload.values': valuesWithEncryptedPass }})
      }

      if (payload.value) {
        const encryptedPass = encrypt(getNestedValue(payload.value, passwordPropName))
        const valueWithEncryptedPass = assign(payload.value, { $set: { [passwordPropName]: encryptedPass } })
        reqDataWithEncryptedPass = assign(reqData, { $set: { 'payload.value': valueWithEncryptedPass }})
      }

      return reqDataWithEncryptedPass
    }
    case 'update':
    case 'updateAndGet':
    case 'updateAndFetch': {

      const operators = reqData.payload.operators

      let operatorsWithEncryptedPass = {}

      Object.keys(operators).forEach(key => {
        const encryptedPass = encrypt(getNestedValue(operators[key], passwordPropName))
        operatorsWithEncryptedPass = assign(operators, { $set: { [`${key}.${passwordPropName}`]: encryptedPass } })
        reqDataWithEncryptedPass = assign(reqData, { $set: { 'payload.operators': operatorsWithEncryptedPass }})
      })

      return reqDataWithEncryptedPass
    }
    default:
      return reqData
  }
}
