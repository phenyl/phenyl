// @flow
import type {
  ClientPool,
  CustomQuery,
  CustomQueryHandler,
  CustomQueryDefinitions,
  CustomQueryResult,
  CustomCommand,
  CustomCommandHandler,
  CustomCommandDefinitions,
  CustomCommandResult,
  Session,
} from 'phenyl-interfaces'

export type CustomExecutionSettings = {
  queries: CustomQueryDefinitions,
  commands: CustomCommandDefinitions,
}

export type CustomExecutionHandlers = {
  queryHandler: CustomQueryHandler,
  commandHandler: CustomCommandHandler,
}

/**
 *
 */
export default function createCustomExecutionHandlers(settings: CustomExecutionSettings): CustomExecutionHandlers {
  return {
    queryHandler: createCustomQueryHandler(settings.queries),
    commandHandler: createCustomCommandHandler(settings.commands),
  }
}

/**
 *
 */
export function createCustomQueryHandler(querySettings: CustomQueryDefinitions): CustomQueryHandler {
  return function executeCustomQuery(query: CustomQuery, session: ?Session, clients: ClientPool): Promise<CustomQueryResult> {
    const { name } = query
    const setting = querySettings[name]
    if (setting == null || typeof setting.execution !== 'function') {
      throw new Error(`No execution function found for custom query named "${name}".`)
    }
    return setting.execution(query, session, clients)
  }
}

/**
 *
 */
export function createCustomCommandHandler(commandSettings: CustomCommandDefinitions): CustomCommandHandler {
  return function executeCustomCommand(command: CustomCommand, session: ?Session, clients: ClientPool): Promise<CustomCommandResult> {
    const { name } = command
    const setting = commandSettings[name]
    if (setting == null || typeof setting.execution !== 'function') {
      throw new Error(`No execution function found for custom command named "${name}".`)
    }
    return setting.execution(command, session, clients)
  }
}

/**
 *
 */
export function normalizeCustomHandlers(handlers: ?CustomExecutionHandlers): CustomExecutionHandlers {
  const normalized = Object.assign({}, handlers)
  if (normalized.queryHandler == null) {
    normalized.queryHandler = createCustomQueryHandler({})
  }
  if (normalized.commandHandler == null) {
    normalized.commandHandler = createCustomCommandHandler({})
  }
  return normalized
}
