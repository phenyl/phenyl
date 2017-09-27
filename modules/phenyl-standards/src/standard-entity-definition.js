// @flow
import type {
  EntityDefinition,
  RequestData,
  Session,
  ClientPool,
  ResponseData,
  CoreExecution,
} from 'phenyl-interfaces'

type AclSetting = {
}

export default class StandardUserDefinition implements EntityDefinition {
  aclSetting: AclSetting

  constructor(aclSetting: AclSetting) {
    this.aclSetting = aclSetting
  }

  async acl(reqData: RequestData, session: ?Session, clients: ClientPool): Promise<boolean> {
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
