// @flow
import type {
  LoginCommand,
  LoginCommandResult,
  AuthenticationHandler,
  AuthenticationResult,
  Session,
  UserDefinitions,
} from 'phenyl-interfaces'

/**
 *
 */
export default function createAuthenticationHandler(userEntityDefinitions: UserDefinitions): AuthenticationHandler {
  return async function authenticationHandler(loginCommand: LoginCommand, session: ?Session) :Promise<AuthenticationResult> {
    const { entityName } = loginCommand
    const definition = userEntityDefinitions[entityName]
    if (definition == null || typeof definition.authentication !== 'function') {
      throw new Error(`No authentication function found for user entity named "${entityName}".`)
    }
    return definition.authentication(loginCommand, session)
  }
}
