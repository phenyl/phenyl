// @flow
import type {
  EntityDefinition,
  RequestData,
  Session,
  ClientPool,
  ResponseData,
  CoreExecution,
} from 'phenyl-interfaces'

type AuthorizationSetting = {
}

export default class StandardEntityDefinition implements EntityDefinition {
  authorizationSetting: AuthorizationSetting

  constructor(authorizationSetting: AuthorizationSetting) {
    this.authorizationSetting = authorizationSetting
  }

  async authorization(reqData: RequestData, session: ?Session, clients: ClientPool): Promise<boolean> {
    // TODO
    return false
  }

  async validation(reqData: RequestData, session: ?Session, clients: ClientPool): Promise<boolean> {
    // TODO
    return false
  }

  async executionWrapper(reqData: RequestData, session: ?Session, clients: ClientPool, execution: CoreExecution): Promise<ResponseData> {
    return execution(reqData, session)
  }
}
