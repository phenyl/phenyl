// @flow
import type {
  EntityDefinition,
  RequestData,
  Session,
  ResponseData,
  CoreExecution,
} from 'phenyl-interfaces'

import type {
  EncryptFunction,
} from '../decls/index.js.flow'


export function encryptPasswordInRequestData(reqData: RequestData, passwordPropName: string, encrpt: EncryptFunction): RequestData {
  // TODO
  return reqData
}
