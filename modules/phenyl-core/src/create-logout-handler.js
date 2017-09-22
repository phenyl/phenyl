// @flow
import type {
  LogoutCommand,
  LogoutCommandResult,
  LogoutHandler,
  ClientPool,
  Session,
  UserEntityDefinitions,
} from 'phenyl-interfaces'

/**
 *
 */
export default function createLogoutHandler(userEntityDefinitions: UserEntityDefinitions): LogoutHandler {
  return async function logoutHandler(logoutCommand: LogoutCommand, session: ?Session, clients: ClientPool) :Promise<LogoutCommandResult> {
    const { entityName } = logoutCommand
    const definition = userEntityDefinitions[entityName]
    if (definition == null || typeof definition.logout !== 'function') {
      throw new Error(`No logout function found for user entity named "${entityName}".`)
    }
    return definition.logout(logoutCommand, session, clients)
  }
}
