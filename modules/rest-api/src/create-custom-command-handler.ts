import {
  CustomCommand,
  CustomCommandHandler,
  CustomCommandDefinitions,
  CustomCommandResult,
  Session,
} from 'phenyl-interfaces'
/**
 *
 */

export function createCustomCommandHandler(commandDefinitions: CustomCommandDefinitions<>): CustomCommandHandler {
  return function customCommandHandler(
    command: CustomCommand<>,
    session: Session | undefined | null,
  ): Promise<CustomCommandResult<>> {
    const { name } = command
    const definition = commandDefinitions[name]

    if (definition == null || typeof definition.execution !== 'function') {
      throw new Error(`No execution function found for custom command named "${name}".`)
    }

    return definition.execution(command, session)
  }
}
