// @flow
import type {
  ValidationHandler,
  ClientPool,
  ExecutionWrapper,
  FunctionalGroup,
  RequestData,
  ResponseData,
  Session,
} from 'phenyl-interfaces'

function assertValidationFunction(fn: any, name: string, methodName: string) {
  if (typeof fn !== 'function') throw new Error(`No validation function found for ${name} (methodName = ${methodName})`)
}

/**
 *
 */
export default function createValidationHandler(fg: FunctionalGroup): ValidationHandler {
  const { users, nonUsers, customQueries, customCommands } = fg
  return async function validationHandler(reqData: RequestData, session: ?Session, clients: ClientPool) :Promise<boolean> {
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
        // $FlowIssue(request-data-has-the-same-key-as-method)
        const data = reqData[method]
        const entityDefinition = nonUsers[data.entityName] || users[data.entityName]
        if (entityDefinition == null) throw new Error(`Unkown entity name "${data.entityName}".`)
        assertValidationFunction(entityDefinition.validation, data.entityName, method)
        return entityDefinition.validation(reqData, session, clients)
      }

      case 'runCustomQuery':
        const { runCustomQuery } = reqData
        const customQueryDefinition = customQueries[runCustomQuery.name]
        if (customQueryDefinition == null) throw new Error(`Unknown custom query name "${runCustomQuery.name}".`)
        assertValidationFunction(customQueryDefinition.validation, runCustomQuery.name, method)
        return customQueryDefinition.validation(runCustomQuery, session, clients)

      case 'runCustomCommand':
        const { runCustomCommand } = reqData
        const customCommandDefinition = customCommands[runCustomCommand.name]
        if (customCommandDefinition == null) throw new Error(`Unknown custom command name "${runCustomCommand.name}".`)
        assertValidationFunction(customCommandDefinition.validation, runCustomCommand.name, method)
        return customCommandDefinition.validation(runCustomCommand, session, clients)

      case 'login':
        const { login } = reqData
        const userEntityDefinition = users[login.entityName]
        if (userEntityDefinition == null) throw new Error(`Unknown entity name "${login.entityName}".`)
        assertValidationFunction(userEntityDefinition.validation, login.entityName, method)
        return userEntityDefinition.validation(reqData, session, clients)

      case 'logout': {
        const { logout } = reqData
        const userEntityDefinition = users[logout.entityName]
        if (userEntityDefinition == null) throw new Error(`Unknown entity name "${logout.entityName}".`)
        assertValidationFunction(userEntityDefinition.validation, logout.entityName, method)
        return userEntityDefinition.validation(reqData, session, clients)
      }
      default:
        throw new Error(`Unknown method "${method}" given in RequestData.`)
    }
  }
}
