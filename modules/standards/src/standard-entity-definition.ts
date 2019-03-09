import {
  EntityDefinition,
  RequestData,
  Session,
  // @ts-ignore remove this comment after @phenyl/interfaces released
} from '@phenyl/interfaces'

type AuthorizationSetting = {
}

export class StandardEntityDefinition implements EntityDefinition {
  authorizationSetting: AuthorizationSetting

  constructor(authorizationSetting: AuthorizationSetting) {
    this.authorizationSetting = authorizationSetting
  }

  async authorization(reqData: RequestData, session: Session | null | undefined): Promise<boolean> { // eslint-disable-line no-unused-vars
    // TODO
    return false
  }

  async validation(reqData: RequestData, session: Session | null | undefined): Promise<void> { // eslint-disable-line no-unused-vars
  }
}
