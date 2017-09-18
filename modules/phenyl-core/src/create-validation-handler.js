// @flow
import type {
  ValidationHandler,
  FunctionalGroup,
  RequestData,
  PhenylClient,
  Session,
} from 'phenyl-interfaces'

function assertValidationFunction(fn: any, name: string, methodName: string) {
  if (typeof fn !== 'string') throw new Error(`No validation function found for ${name} (methodName = ${methodName})`)
}

/**
 *
 */
export default function createValidationHandler(fg: FunctionalGroup): ValidationHandler {
  return async function isValid(reqData: RequestData, session: ?Session, client: PhenylClient) :Promise<boolean> {
    return true // TODO
  }
}
