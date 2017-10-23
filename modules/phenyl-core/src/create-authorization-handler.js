// @flow
import type {
  AuthorizationHandler,
  ClientPool,
  ExecutionWrapper,
  FunctionalGroup,
  RequestData,
  ResponseData,
  Session,
} from 'phenyl-interfaces'

function assertAuthorizationFunction(fn: any, name: string, methodName: string) {
  if (typeof fn !== 'function') throw new Error(`No authorization function found for ${name} (methodName = ${methodName})`)
}

/**
 *
 */
export default function createAuthorizationHandler(fg: FunctionalGroup): AuthorizationHandler {
  const { users, nonUsers, customQueries, customCommands } = fg
  return async function authorizationHandler(reqData: RequestData, session: ?Session, clients: ClientPool) :Promise<boolean> {
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
        assertAuthorizationFunction(entityDefinition.authorization, data.entityName, method)
        return entityDefinition.authorization(reqData, session, clients)
      }

      case 'runCustomQuery': {
        const { payload } = reqData
        const customQueryDefinition = customQueries[payload.name]
        if (customQueryDefinition == null) throw new Error(`Unknown custom query name "${payload.name}".`)
        assertAuthorizationFunction(customQueryDefinition.authorization, payload.name, method)
        return customQueryDefinition.authorization(payload, session, clients)
      }

      case 'runCustomCommand': {
        const { payload } = reqData
        const customCommandDefinition = customCommands[payload.name]
        if (customCommandDefinition == null) throw new Error(`Unknown custom command name "${payload.name}".`)
        assertAuthorizationFunction(customCommandDefinition.authorization, payload.name, method)
        return customCommandDefinition.authorization(payload, session, clients)
      }

      case 'logout':
      case 'login': {
        const { payload } = reqData
        const userEntityDefinition = users[payload.entityName]
        if (userEntityDefinition == null) throw new Error(`Unknown entity name "${payload.entityName}".`)
        assertAuthorizationFunction(userEntityDefinition.authorization, payload.entityName, method)
        return userEntityDefinition.authorization(reqData, session, clients)
      }
      default:
        throw new Error(`Unknown method "${method}" given in RequestData.`)
    }
  }
}
