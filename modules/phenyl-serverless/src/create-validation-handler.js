// @flow
import type {
  ValidationHandler,
  CustomCommandSettings,
  CustomQuerySettings,
  EntityValidationSettings,
  Operation,
  PhenylClient,
  Session,
} from 'phenyl-interfaces'

export type ValidationSettings = {
  entities: EntityValidationSettings,
  queries: CustomQuerySettings,
  commands: CustomCommandSettings,
}

function assertValidationFunction(fn: any, name: string, operationName: string) {
  if (typeof fn !== 'string') throw new Error(`No validation function found for ${name} (operation = ${operationName})`)
}

/**
 *
 */
export default function createValidationHandler(settings: ValidationSettings): ValidationHandler {
  return async function isValid(operation: Operation, session: ?Session, client: PhenylClient) :Promise<boolean> {
    if (operation.find != null) {
      const query = operation.find
      const entityName = query.from
      const validationHandler = settings.entities[entityName].find
      assertValidationFunction(validationHandler, entityName, 'find')
      return validationHandler(query, session, client)
    }

    if (operation.findOne != null) {
      const query = operation.findOne
      const entityName = query.from
      const validationHandler = settings.entities[entityName].findOne
      assertValidationFunction(validationHandler, entityName, 'findOne')
      return validationHandler(query, session, client)
    }

    if (operation.get != null) {
      const query = operation.get
      const entityName = query.from
      const validationHandler = settings.entities[entityName].get
      assertValidationFunction(validationHandler, entityName, 'get')
      return validationHandler(query, session, client)
    }

    if (operation.getByIds != null) {
      const query = operation.getByIds
      const entityName = query.from
      const validationHandler = settings.entities[entityName].getByIds
      assertValidationFunction(validationHandler, entityName, 'getByIds')
      return validationHandler(query, session, client)
    }

    if (operation.insert != null) {
      const command = operation.insert
      const entityName = command.from
      const validationHandler = settings.entities[entityName].insert
      assertValidationFunction(validationHandler, entityName, 'insert')
      return validationHandler(command, session, client)
    }

    if (operation.insertAndGet != null) {
      const command = operation.insertAndGet
      const entityName = command.from
      const validationHandler = settings.entities[entityName].insertAndGet
      assertValidationFunction(validationHandler, entityName, 'insertAndGet')
      return validationHandler(command, session, client)
    }

    if (operation.insertAndFetch != null) {
      const command = operation.insertAndFetch
      const entityName = command.from
      const validationHandler = settings.entities[entityName].insertAndFetch
      assertValidationFunction(validationHandler, entityName, 'insertAndFetch')
      return validationHandler(command, session, client)
    }

    if (operation.update != null) {
      const command = operation.update
      const entityName = command.from
      const validationHandler = settings.entities[entityName].update
      assertValidationFunction(validationHandler, entityName, 'update')
      return validationHandler(command, session, client)
    }

    if (operation.updateAndGet != null) {
      const command = operation.updateAndGet
      const entityName = command.from
      const validationHandler = settings.entities[entityName].updateAndGet
      assertValidationFunction(validationHandler, entityName, 'updateAndGet')
      return validationHandler(command, session, client)
    }

    if (operation.updateAndFetch != null) {
      const command = operation.updateAndFetch
      const entityName = command.from
      const validationHandler = settings.entities[entityName].updateAndFetch
      assertValidationFunction(validationHandler, entityName, 'updateAndFetch')
      return validationHandler(command, session, client)
    }

    if (operation.delete != null) {
      const command = operation.delete
      const entityName = command.from
      const validationHandler = settings.entities[entityName].delete
      assertValidationFunction(validationHandler, entityName, 'delete')
      return validationHandler(command, session, client)
    }

    if (operation.runCustomQuery != null) {
      const query = operation.runCustomQuery
      const { name } = query
      const validationHandler = settings.queries[name].validation
      assertValidationFunction(validationHandler, name, 'runCustomQuery')
      return validationHandler(query, session, client)
    }

    if (operation.runCustomCommand != null) {
      const command = operation.runCustomCommand
      const { name } = command
      const validationHandler = settings.commands[name].validation
      assertValidationFunction(validationHandler, name, 'runCustomCommand')
      return validationHandler(command, session, client)
    }

    throw new Error('Invalid operation.')
  }
}
