import { AuthorizationHandler, NormalizedFunctionalGroup, RequestData, Session } from 'phenyl-interfaces'

function assertAuthorizationFunction(fn: any, name: string, methodName: string) {
  if (typeof fn !== 'function')
    throw new Error(`No authorization function found for ${name} (methodName = ${methodName})`)
}
/**
 *
 */

export function createAuthorizationHandler(fg: NormalizedFunctionalGroup): AuthorizationHandler {
  const { users, nonUsers, customQueries, customCommands } = fg
  return async function authorizationHandler(
    reqData: RequestData,
    session: Session | undefined | null,
  ): Promise<boolean> {
    const { method } = reqData

    switch (reqData.method) {
      case 'find':
      case 'findOne':
      case 'get':
      case 'getByIds':
      case 'pull':
      case 'insertOne':
      case 'insertMulti':
      case 'insertAndGet':
      case 'insertAndGetMulti':
      case 'updateById':
      case 'updateMulti':
      case 'updateAndGet':
      case 'updateAndFetch':
      case 'push':
      case 'delete': {
        const data = reqData.payload
        const entityDefinition = nonUsers[data.entityName] || users[data.entityName]
        if (entityDefinition == null) throw new Error(`Unkown entity name "${data.entityName}".`)
        assertAuthorizationFunction(entityDefinition.authorization, data.entityName, method)
        return entityDefinition.authorization(reqData, session)
      }

      case 'runCustomQuery': {
        const { payload } = reqData
        const customQueryDefinition = customQueries[payload.name]
        if (customQueryDefinition == null) throw new Error(`Unknown custom query name "${payload.name}".`)
        assertAuthorizationFunction(customQueryDefinition.authorization, payload.name, method)
        return customQueryDefinition.authorization(payload, session)
      }

      case 'runCustomCommand': {
        const { payload } = reqData
        const customCommandDefinition = customCommands[payload.name]
        if (customCommandDefinition == null) throw new Error(`Unknown custom command name "${payload.name}".`)
        assertAuthorizationFunction(customCommandDefinition.authorization, payload.name, method)
        return customCommandDefinition.authorization(payload, session)
      }

      case 'logout':
      case 'login': {
        const { payload } = reqData
        const userEntityDefinition = users[payload.entityName]
        if (userEntityDefinition == null) throw new Error(`Unknown entity name "${payload.entityName}".`)
        assertAuthorizationFunction(userEntityDefinition.authorization, payload.entityName, method)
        return userEntityDefinition.authorization(reqData, session)
      }

      default:
        throw new Error(`Unknown method "${method}" given in RequestData.`)
    }
  }
}
