// @flow
import PhenylCore from './phenyl-core.js'
import createAuthorizationHandler from './create-authorization-handler.js'
import createValidationHandler from './create-validation-handler.js'
import createCustomQueryHandler from './create-custom-query-handler.js'
import createCustomCommandHandler from './create-custom-command-handler.js'
import createAuthenticationHandler from './create-authentication-handler.js'
import createExecutionWrapper from './create-execution-wrapper.js'
import PhenylCoreDirectClient from './direct-client.js'

export default PhenylCore
export {
  createAuthorizationHandler,
  createCustomQueryHandler,
  createCustomCommandHandler,
  createExecutionWrapper,
  createAuthenticationHandler,
  createValidationHandler,
  PhenylCoreDirectClient,
}
