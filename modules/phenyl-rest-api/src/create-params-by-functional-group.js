// @flow
import { createAuthenticationHandler } from './create-authentication-handler.js'
import { createAuthorizationHandler } from './create-authorization-handler.js'
import { createCustomQueryHandler } from './create-custom-query-handler.js'
import { createNormalizationHandler } from './create-normalization-handler.js'
import { createCustomCommandHandler } from './create-custom-command-handler.js'
import { createExecutionWrapper } from './create-execution-wrapper.js'
import { createValidationHandler } from './create-validation-handler.js'

import type {
  NormalizedFunctionalGroup,
  HandlerParams,
} from 'phenyl-interfaces'

export function createParamsByFunctionalGroup(fg: NormalizedFunctionalGroup): HandlerParams {
  const authenticationHandler = createAuthenticationHandler(fg.users)
  const authorizationHandler = createAuthorizationHandler(fg)
  const normalizationHandler = createNormalizationHandler(fg)
  const validationHandler = createValidationHandler(fg)
  const customQueryHandler = createCustomQueryHandler(fg.customQueries)
  const customCommandHandler = createCustomCommandHandler(fg.customCommands)
  const executionWrapper = createExecutionWrapper(fg)

  return {
    authenticationHandler,
    authorizationHandler,
    normalizationHandler,
    validationHandler,
    customQueryHandler,
    customCommandHandler,
    executionWrapper,
  }
}
