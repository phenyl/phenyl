// @flow
import type {
  EntityDefinition,
  RequestData,
  Session,
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

  async authorization(reqData: RequestData, session: ?Session): Promise<boolean> {
    // TODO
    return false
  }

  async validation(reqData: RequestData, session: ?Session): Promise<boolean> {
    // TODO
    return false
  }

  async wrapExecution(reqData: RequestData, session: ?Session, execution: CoreExecution): Promise<ResponseData> {
    return execution(reqData, session)
  }
}
