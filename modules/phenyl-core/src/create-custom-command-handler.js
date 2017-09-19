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
  return function executeCustomCommand(command: CustomCommand, session: ?Session, clients: ClientPool): Promise<CustomCommandResult> {
    const { name } = command
    const setting = commandDefinitions[name]
    if (setting == null || typeof setting.execution !== 'function') {
      throw new Error(`No execution function found for custom command named "${name}".`)
    }
    return setting.execution(command, session, clients)
  }
}
