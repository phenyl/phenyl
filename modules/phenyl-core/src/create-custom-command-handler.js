// @flow
import type {
  ClientPool,
  CustomCommand,
  CustomCommandHandler,
  CustomCommandDefinitions,
  CustomCommandResult,
  Session,
} from 'phenyl-interfaces'

/**
 *
 */
export default function createCustomCommandHandler(commandDefinitions: CustomCommandDefinitions): CustomCommandHandler {
  return function customCommandHandler(command: CustomCommand, session: ?Session, clients: ClientPool): Promise<CustomCommandResult> {
    const { name } = command
    const definition = commandDefinitions[name]
    if (definition == null || typeof definition.execution !== 'function') {
      throw new Error(`No execution function found for custom command named "${name}".`)
    }
    return definition.execution(command, session, clients)
  }
}
