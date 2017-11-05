// @flow
import type {
  ValidationHandler,
  FunctionalGroup,
  RequestData,
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
  return async function validationHandler(reqData: RequestData, session: ?Session) :Promise<void> {
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
        assertValidationFunction(entityDefinition.validation, data.entityName, method)
        return entityDefinition.validation(reqData, session)
      }

      case 'runCustomQuery': {
        const { payload } = reqData
        const customQueryDefinition = customQueries[payload.name]
        if (customQueryDefinition == null) throw new Error(`Unknown custom query name "${payload.name}".`)
        assertValidationFunction(customQueryDefinition.validation, payload.name, method)
        return customQueryDefinition.validation(payload, session)
      }

      case 'runCustomCommand': {
        const { payload } = reqData
        const customCommandDefinition = customCommands[payload.name]
        if (customCommandDefinition == null) throw new Error(`Unknown custom command name "${payload.name}".`)
        assertValidationFunction(customCommandDefinition.validation, payload.name, method)
        return customCommandDefinition.validation(payload, session)
      }

      case 'login':
      case 'logout': {
        const { payload } = reqData
        const userEntityDefinition = users[payload.entityName]
        if (userEntityDefinition == null) throw new Error(`Unknown entity name "${payload.entityName}".`)
        assertValidationFunction(userEntityDefinition.validation, payload.entityName, method)
        return userEntityDefinition.validation(reqData, session)
      }
      default:
        throw new Error(`Unknown method "${method}" given in RequestData.`)
    }
  }
}
