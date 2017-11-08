// @flow
import PhenylRestApi from './phenyl-rest-api.js'
import createAuthorizationHandler from './create-authorization-handler.js'
import createValidationHandler from './create-validation-handler.js'
import createCustomQueryHandler from './create-custom-query-handler.js'
import createCustomCommandHandler from './create-custom-command-handler.js'
import createAuthenticationHandler from './create-authentication-handler.js'
import createExecutionWrapper from './create-execution-wrapper.js'
import PhenylRestApiDirectClient from './direct-client.js'
import {
  passThroughHandler,
  noHandler,
  simpleExecutionWrapper
} from './default-handlers.js'

export default PhenylRestApi
export {
  createAuthorizationHandler,
  createCustomQueryHandler,
  createCustomCommandHandler,
  createExecutionWrapper,
  createAuthenticationHandler,
  createValidationHandler,
  PhenylRestApiDirectClient,
  passThroughHandler,
  noHandler,
  simpleExecutionWrapper,
}
