// @flow
import { createAuthenticationHandler } from './create-authentication-handler.js'
import { createAuthorizationHandler } from './create-authorization-handler.js'
import { createCustomQueryHandler } from './create-custom-query-handler.js'
import { createCustomCommandHandler } from './create-custom-command-handler.js'
import { createExecutionWrapper } from './create-execution-wrapper.js'
import { createValidationHandler } from './create-validation-handler.js'

import type {
  FunctionalGroup,
  HandlerParams,
} from 'phenyl-interfaces'

export function createParamsByFunctionalGroup(fg: FunctionalGroup): HandlerParams {
  const authenticationHandler = createAuthenticationHandler(fg.users)
  const authorizationHandler = createAuthorizationHandler(fg)
  const validationHandler = createValidationHandler(fg)
  const customQueryHandler = createCustomQueryHandler(fg.customQueries)
  const customCommandHandler = createCustomCommandHandler(fg.customCommands)
  const executionWrapper = createExecutionWrapper(fg)

  return {
    authenticationHandler,
    authorizationHandler,
    validationHandler,
    customQueryHandler,
    customCommandHandler,
    executionWrapper,
  }
}
