// @flow
import type {
  ValidationHandler,
  CustomCommandSettings,
  CustomQuerySettings,
  EntityValidationSettings,
  Request,
  PhenylClient,
  Session,
} from 'phenyl-interfaces'

export type ValidationSettings = {
  entities: EntityValidationSettings,
  queries: CustomQuerySettings,
  commands: CustomCommandSettings,
}

function assertValidationFunction(fn: any, name: string, requestName: string) {
  if (typeof fn !== 'string') throw new Error(`No validation function found for ${name} (request = ${requestName})`)
}

/**
 *
 */
export default function createValidationHandler(settings: ValidationSettings): ValidationHandler {
  return async function isValid(request: Request, session: ?Session, client: PhenylClient) :Promise<boolean> {
    if (request.find != null) {
      const query = request.find
      const entityName = query.from
      const validationHandler = settings.entities[entityName].find
      assertValidationFunction(validationHandler, entityName, 'find')
      return validationHandler(query, session, client)
    }

    if (request.findOne != null) {
      const query = request.findOne
      const entityName = query.from
      const validationHandler = settings.entities[entityName].findOne
      assertValidationFunction(validationHandler, entityName, 'findOne')
      return validationHandler(query, session, client)
    }

    if (request.get != null) {
      const query = request.get
      const entityName = query.from
      const validationHandler = settings.entities[entityName].get
      assertValidationFunction(validationHandler, entityName, 'get')
      return validationHandler(query, session, client)
    }

    if (request.getByIds != null) {
      const query = request.getByIds
      const entityName = query.from
      const validationHandler = settings.entities[entityName].getByIds
      assertValidationFunction(validationHandler, entityName, 'getByIds')
      return validationHandler(query, session, client)
    }

    if (request.insert != null) {
      const command = request.insert
      const entityName = command.from
      const validationHandler = settings.entities[entityName].insert
      assertValidationFunction(validationHandler, entityName, 'insert')
      return validationHandler(command, session, client)
    }

    if (request.insertAndGet != null) {
      const command = request.insertAndGet
      const entityName = command.from
      const validationHandler = settings.entities[entityName].insertAndGet
      assertValidationFunction(validationHandler, entityName, 'insertAndGet')
      return validationHandler(command, session, client)
    }

    if (request.insertAndFetch != null) {
      const command = request.insertAndFetch
      const entityName = command.from
      const validationHandler = settings.entities[entityName].insertAndFetch
      assertValidationFunction(validationHandler, entityName, 'insertAndFetch')
      return validationHandler(command, session, client)
    }

    if (request.update != null) {
      const command = request.update
      const entityName = command.from
      const validationHandler = settings.entities[entityName].update
      assertValidationFunction(validationHandler, entityName, 'update')
      return validationHandler(command, session, client)
    }

    if (request.updateAndGet != null) {
      const command = request.updateAndGet
      const entityName = command.from
      const validationHandler = settings.entities[entityName].updateAndGet
      assertValidationFunction(validationHandler, entityName, 'updateAndGet')
      return validationHandler(command, session, client)
    }

    if (request.updateAndFetch != null) {
      const command = request.updateAndFetch
      const entityName = command.from
      const validationHandler = settings.entities[entityName].updateAndFetch
      assertValidationFunction(validationHandler, entityName, 'updateAndFetch')
      return validationHandler(command, session, client)
    }

    if (request.delete != null) {
      const command = request.delete
      const entityName = command.from
      const validationHandler = settings.entities[entityName].delete
      assertValidationFunction(validationHandler, entityName, 'delete')
      return validationHandler(command, session, client)
    }

    if (request.runCustomQuery != null) {
      const query = request.runCustomQuery
      const { name } = query
      const validationHandler = settings.queries[name].validation
      assertValidationFunction(validationHandler, name, 'runCustomQuery')
      return validationHandler(query, session, client)
    }

    if (request.runCustomCommand != null) {
      const command = request.runCustomCommand
      const { name } = command
      const validationHandler = settings.commands[name].validation
      assertValidationFunction(validationHandler, name, 'runCustomCommand')
      return validationHandler(command, session, client)
    }

    throw new Error('Invalid request.')
  }
}
