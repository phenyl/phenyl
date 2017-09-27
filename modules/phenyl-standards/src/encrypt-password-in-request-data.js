// @flow
import type {
  EntityDefinition,
  RequestData,
  Session,
  ClientPool,
  ResponseData,
  CoreExecution,
} from 'phenyl-interfaces'

import type {
  EncryptFunction,
} from '../decls/index.js.flow'


export default function encryptPasswordInRequestData(reqData: RequestData, passwordPropName: string, encrpt: EncryptFunction): RequestData {
  // TODO
  return reqData
}
