import {
  GeneralRequestData,
} from '@phenyl/interfaces'

import { DocumentPath } from 'mongolike-operations'

import {
  EncryptFunction,
} from '../decls/index'

import { getNestedValue } from 'oad-utils/jsnext'

import { assign } from 'power-assign/jsnext'


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
            return assign(value, { $set: { [passwordPropName]: encrypt(password)} })
          } else {
            return value
          }
        })

        return assign(reqData, { $set: { 'payload.values': valuesWithEncryptedPass }})
      } else if (value) {
        const password = getNestedValue(value, passwordPropName)

        if (password) {
          const valueWithEncryptedPass = assign(value, { $set: { [passwordPropName]: encrypt(password) } })
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
