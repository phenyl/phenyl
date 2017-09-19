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
    switch (method) {
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
        const data = reqData[method]
        if (data == null) throw new Error(`property "${method}" not found in RequestData.`) // for flow
        const entityDefinition = nonUsers[data.entityName] || users[data.entityName]
        if (entityDefinition == null) throw new Error(`Unkown entity name "${data.entityName}".`)
        assertValidationFunction(entityDefinition.validation, data.entityName, method)
        return entityDefinition.validation(reqData, session, clients)
      }

      case 'runCustomQuery':
        const { runCustomQuery } = reqData
        if (runCustomQuery == null) throw new Error('property "runCustomQuery" not found in RequestData.') // for flow
        const customQueryDefinition = customQueries[runCustomQuery.name]
        if (customQueryDefinition == null) throw new Error(`Unknown custom query name "${runCustomQuery.name}".`)
        assertValidationFunction(customQueryDefinition.validation, runCustomQuery.name, method)
        return customQueryDefinition.validation(runCustomQuery, session, clients)

      case 'runCustomCommand':
        const { runCustomCommand } = reqData
        if (runCustomCommand == null) throw new Error('property "runCustomCommand" not found in RequestData.') // for flow
        const customCommandDefinition = customCommands[runCustomCommand.name]
        if (customCommandDefinition == null) throw new Error(`Unknown custom command name "${runCustomCommand.name}".`)
        assertValidationFunction(customCommandDefinition.validation, runCustomCommand.name, method)
        return customCommandDefinition.validation(runCustomCommand, session, clients)

      case 'login':
        const { login } = reqData
        if (login == null) throw new Error('property "login" not found in RequestData.') // for flow
        const userEntityDefinition = users[login.entityName]
        if (userEntityDefinition == null) throw new Error(`Unknown entity name "${login.entityName}".`)
        assertValidationFunction(userEntityDefinition.validation, login.entityName, method)
        return userEntityDefinition.validation(reqData, session, clients)

      case 'logout': {
        const { logout } = reqData
        if (logout == null) throw new Error('property "logout" not found in RequestData.') // for flow
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
