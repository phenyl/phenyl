// @flow
import type {
  LoginCommand,
  LoginCommandResult,
  LoginHandler,
  ClientPool,
  Session,
  UserEntityDefinitions,
} from 'phenyl-interfaces'

/**
 *
 */
export default function createLoginHandler(userEntityDefinitions: UserEntityDefinitions): LoginHandler {
  return async function loginHandler(loginCommand: LoginCommand, session: ?Session, clients: ClientPool) :Promise<LoginCommandResult> {
    const { entityName } = loginCommand
    const definition = userEntityDefinitions[entityName]
    if (definition == null || typeof definition.login !== 'function') {
      throw new Error(`No login function found for user entity named "${entityName}".`)
    }
    return definition.login(loginCommand, session, clients)
  }
}
