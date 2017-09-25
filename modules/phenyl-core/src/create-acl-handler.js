// @flow
import type {
  AclHandler,
  ClientPool,
  ExecutionWrapper,
  FunctionalGroup,
  RequestData,
  ResponseData,
  Session,
} from 'phenyl-interfaces'

function assertAclFunction(fn: any, name: string, methodName: string) {
  if (typeof fn !== 'function') throw new Error(`No acl function found for ${name} (methodName = ${methodName})`)
}

/**
 *
 */
export default function createAclHandler(fg: FunctionalGroup): AclHandler {
  const { users, nonUsers, customQueries, customCommands } = fg
  return async function aclHandler(reqData: RequestData, session: ?Session, clients: ClientPool) :Promise<boolean> {
    const { method } = reqData
    switch (reqData.method) {
      case 'find':
      case 'findOne':
      case 'get':
      case 'getByIds':
      case 'insert':
      case 'insertAndGet':
      case 'insertAndFetch':
      case 'update':
      case 'updateAndGet':
      case 'updateAndFetch':
      case 'delete': {
        // $FlowIssue(request-data-has-the-same-key-as-method)
        const data = reqData[method]
        const entityDefinition = nonUsers[data.entityName] || users[data.entityName]
        if (entityDefinition == null) throw new Error(`Unkown entity name "${data.entityName}".`)
        assertAclFunction(entityDefinition.acl, data.entityName, method)
        return entityDefinition.acl(reqData, session, clients)
      }

      case 'runCustomQuery':
        const { runCustomQuery } = reqData
        const customQueryDefinition = customQueries[runCustomQuery.name]
        if (customQueryDefinition == null) throw new Error(`Unknown custom query name "${runCustomQuery.name}".`)
        assertAclFunction(customQueryDefinition.acl, runCustomQuery.name, method)
        return customQueryDefinition.acl(runCustomQuery, session, clients)

      case 'runCustomCommand':
        const { runCustomCommand } = reqData
        const customCommandDefinition = customCommands[runCustomCommand.name]
        if (customCommandDefinition == null) throw new Error(`Unknown custom command name "${runCustomCommand.name}".`)
        assertAclFunction(customCommandDefinition.acl, runCustomCommand.name, method)
        return customCommandDefinition.acl(runCustomCommand, session, clients)

      case 'login':
        const { login } = reqData
        const userEntityDefinition = users[login.entityName]
        if (userEntityDefinition == null) throw new Error(`Unknown entity name "${login.entityName}".`)
        assertAclFunction(userEntityDefinition.acl, login.entityName, method)
        return userEntityDefinition.acl(reqData, session, clients)

      case 'logout': {
        const { logout } = reqData
        const userEntityDefinition = users[logout.entityName]
        if (userEntityDefinition == null) throw new Error(`Unknown entity name "${logout.entityName}".`)
        assertAclFunction(userEntityDefinition.acl, logout.entityName, method)
        return userEntityDefinition.acl(reqData, session, clients)
      }
      default:
        throw new Error(`Unknown method "${method}" given in RequestData.`)
    }
  }
}
