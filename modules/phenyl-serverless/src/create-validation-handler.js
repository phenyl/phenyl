// @flow
import type {
  ValidationHandler,
  CustomCommandDefinitions,
  CustomQueryDefinitions,
  EntityValidationSettings,
  RequestData,
  PhenylClient,
  Session,
} from 'phenyl-interfaces'

export type ValidationSettings = {
  entities: EntityValidationSettings,
  queries: CustomQueryDefinitions,
  commands: CustomCommandDefinitions,
}

function assertValidationFunction(fn: any, name: string, methodName: string) {
  if (typeof fn !== 'string') throw new Error(`No validation function found for ${name} (methodName = ${methodName})`)
}

/**
 *
 */
export default function createValidationHandler(settings: ValidationSettings): ValidationHandler {
  return async function isValid(reqData: RequestData, session: ?Session, client: PhenylClient) :Promise<boolean> {
    if (reqData.find != null) {
      const query = reqData.find
      const entityName = query.from
      const validationHandler = settings.entities[entityName].find
      assertValidationFunction(validationHandler, entityName, 'find')
      return validationHandler(query, session, client)
    }

    if (reqData.findOne != null) {
      const query = reqData.findOne
      const entityName = query.from
      const validationHandler = settings.entities[entityName].findOne
      assertValidationFunction(validationHandler, entityName, 'findOne')
      return validationHandler(query, session, client)
    }

    if (reqData.get != null) {
      const query = reqData.get
      const entityName = query.from
      const validationHandler = settings.entities[entityName].get
      assertValidationFunction(validationHandler, entityName, 'get')
      return validationHandler(query, session, client)
    }

    if (reqData.getByIds != null) {
      const query = reqData.getByIds
      const entityName = query.from
      const validationHandler = settings.entities[entityName].getByIds
      assertValidationFunction(validationHandler, entityName, 'getByIds')
      return validationHandler(query, session, client)
    }

    if (reqData.insert != null) {
      const command = reqData.insert
      const entityName = command.from
      const validationHandler = settings.entities[entityName].insert
      assertValidationFunction(validationHandler, entityName, 'insert')
      return validationHandler(command, session, client)
    }

    if (reqData.insertAndGet != null) {
      const command = reqData.insertAndGet
      const entityName = command.from
      const validationHandler = settings.entities[entityName].insertAndGet
      assertValidationFunction(validationHandler, entityName, 'insertAndGet')
      return validationHandler(command, session, client)
    }

    if (reqData.insertAndFetch != null) {
      const command = reqData.insertAndFetch
      const entityName = command.from
      const validationHandler = settings.entities[entityName].insertAndFetch
      assertValidationFunction(validationHandler, entityName, 'insertAndFetch')
      return validationHandler(command, session, client)
    }

    if (reqData.update != null) {
      const command = reqData.update
      const entityName = command.from
      const validationHandler = settings.entities[entityName].update
      assertValidationFunction(validationHandler, entityName, 'update')
      return validationHandler(command, session, client)
    }

    if (reqData.updateAndGet != null) {
      const command = reqData.updateAndGet
      const entityName = command.from
      const validationHandler = settings.entities[entityName].updateAndGet
      assertValidationFunction(validationHandler, entityName, 'updateAndGet')
      return validationHandler(command, session, client)
    }

    if (reqData.updateAndFetch != null) {
      const command = reqData.updateAndFetch
      const entityName = command.from
      const validationHandler = settings.entities[entityName].updateAndFetch
      assertValidationFunction(validationHandler, entityName, 'updateAndFetch')
      return validationHandler(command, session, client)
    }

    if (reqData.delete != null) {
      const command = reqData.delete
      const entityName = command.from
      const validationHandler = settings.entities[entityName].delete
      assertValidationFunction(validationHandler, entityName, 'delete')
      return validationHandler(command, session, client)
    }

    if (reqData.runCustomQuery != null) {
      const query = reqData.runCustomQuery
      const { name } = query
      const validationHandler = settings.queries[name].validation
      assertValidationFunction(validationHandler, name, 'runCustomQuery')
      return validationHandler(query, session, client)
    }

    if (reqData.runCustomCommand != null) {
      const command = reqData.runCustomCommand
      const { name } = command
      const validationHandler = settings.commands[name].validation
      assertValidationFunction(validationHandler, name, 'runCustomCommand')
      return validationHandler(command, session, client)
    }

    throw new Error('Invalid request data.')
  }
}
