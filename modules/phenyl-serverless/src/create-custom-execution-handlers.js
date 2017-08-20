// @flow
import type {
  CustomExecutionHandlers,
  CustomQueryHandler,
  CustomQuerySettings,
  CustomQueryResult,
  CustomCommandHandler,
  CustomCommandSettings,
  CustomCommandResult,
  Session,
  PhenylClient,
} from 'phenyl-interfaces'

export type CustomExecutionSettings = {
  queries: CustomQuerySettings,
  commands: CustomCommandSettings,
}

export type CustomExecutionHandlers = {
  queries: CustomQueryHandler,
  commands: CustomCommandHandler,
}

/**
 *
 */
export default function createCustomExecutionHandlers(settings: CustomExecutionSettings): CustomExecutionHandlers {
  return {
    queries: createCustomQueryHandler(settings.queries),
    commands: createCustomCommandHandler(settings.commands),
  }
}

/**
 *
 */
export function createCustomQueryHandler(querySettings: CustomQuerySettings): CustomQueryHandler {
  return function executeCustomQuery(query: CustomQuery, session: ?Session, client: PhenylClient): CustomQueryResult {
    const { name } = query
    const setting = querySettings[name]
    if (setting == null || typeof setting.execution !== 'function') {
      throw new Error(`No execution function found for custom query named "${name}".`)
    }
    return setting.execution(query, session, client)
  }
}

/**
 *
 */
export function createCustomCommandHandler(commandSettings: CustomCommandSettings): CustomCommandHandler {
  return function executeCustomCommand(command: CustomCommand, session: ?Session, client: PhenylClient): CustomCommandHandler {
    const { name } = command
    const setting = commandSettings[name]
    if (setting == null || typeof setting.execution !== 'function') {
      throw new Error(`No execution function found for custom command named "${name}".`)
    }
    return setting.execution(command, session, client)
  }
}
