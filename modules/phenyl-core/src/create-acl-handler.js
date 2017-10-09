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
      case 'insertAndGetMulti':
      case 'update':
      case 'updateAndGet':
      case 'updateAndFetch':
      case 'delete': {
        const data = reqData.payload
        const entityDefinition = nonUsers[data.entityName] || users[data.entityName]
        if (entityDefinition == null) throw new Error(`Unkown entity name "${data.entityName}".`)
        assertAclFunction(entityDefinition.acl, data.entityName, method)
        return entityDefinition.acl(reqData, session, clients)
      }

      case 'runCustomQuery': {
        const { payload } = reqData
        const customQueryDefinition = customQueries[payload.name]
        if (customQueryDefinition == null) throw new Error(`Unknown custom query name "${payload.name}".`)
        assertAclFunction(customQueryDefinition.acl, payload.name, method)
        return customQueryDefinition.acl(payload, session, clients)
      }

      case 'runCustomCommand': {
        const { payload } = reqData
        const customCommandDefinition = customCommands[payload.name]
        if (customCommandDefinition == null) throw new Error(`Unknown custom command name "${payload.name}".`)
        assertAclFunction(customCommandDefinition.acl, payload.name, method)
        return customCommandDefinition.acl(payload, session, clients)
      }

      case 'logout':
      case 'login': {
        const { payload } = reqData
        const userEntityDefinition = users[payload.entityName]
        if (userEntityDefinition == null) throw new Error(`Unknown entity name "${payload.entityName}".`)
        assertAclFunction(userEntityDefinition.acl, payload.entityName, method)
        return userEntityDefinition.acl(reqData, session, clients)
      }
      default:
        throw new Error(`Unknown method "${method}" given in RequestData.`)
    }
  }
}
