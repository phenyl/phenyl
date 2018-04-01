// @flow
import type {
  EntityDefinition,
  RequestData,
  Session,
} from 'phenyl-interfaces'

type AuthorizationSetting = {
}

export class StandardEntityDefinition implements EntityDefinition {
  authorizationSetting: AuthorizationSetting

  constructor(authorizationSetting: AuthorizationSetting) {
    this.authorizationSetting = authorizationSetting
  }

  async authorization(reqData: RequestData, session: ?Session): Promise<boolean> { // eslint-disable-line no-unused-vars
    // TODO
    return false
  }

  async validation(reqData: RequestData, session: ?Session): Promise<void> { // eslint-disable-line no-unused-vars
  }
}
