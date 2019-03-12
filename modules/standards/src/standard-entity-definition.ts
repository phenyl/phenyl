import {
  EntityDefinition,
  GeneralRequestData,
  Session,
} from '@phenyl/interfaces'

type AuthorizationSetting = {
}

// @ts-ignore @TODO: implement this class
export class StandardEntityDefinition implements EntityDefinition {
  authorizationSetting: AuthorizationSetting

  constructor(authorizationSetting: AuthorizationSetting) {
    this.authorizationSetting = authorizationSetting
  }

  async authorization(reqData: GeneralRequestData, session: Session | null | undefined): Promise<boolean> { // eslint-disable-line no-unused-vars
    // TODO
    return false
  }

  async validation(reqData: GeneralRequestData, session: Session | null | undefined): Promise<void> { // eslint-disable-line no-unused-vars
  }
}
