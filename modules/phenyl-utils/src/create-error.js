// @flow
import type {
  ErrorLocation,
  LocalError,
  LocalErrorType,
  ServerError,
  ServerErrorType,
  PhenylError,
  PhenylErrorType,
} from 'phenyl-interfaces'

const toJSONs = {
  server: function toServerErrorJSON(): ServerError {
    return {
      ok: 0,
      at: 'server',
      type: this.type,
      message: this.message,
      stack: this.stack
    }
  },
  local: function toLocalErrorJSON(): LocalError {
    return {
      ok: 0,
      at: 'local',
      type: this.type,
      message: this.message,
      stack: this.stack
    }
  }
}

const guessErrorTypes = {
  server: function guessServerErrorType(error: Error): ServerErrorType {
    if (error.constructor === Error) {
      return 'BadRequest'
    }
    return 'InternalServer'
  },

  local: function guessLocalErrorType(error: Error): LocalErrorType {
    if (error.constructor === Error) {
      return 'InvalidData'
    }
    return 'CodeProblem'
  }
}

/**
 * Create a PhenylError.
 * Phenyl error is instanceof Error.
 * Phenyl error implements interface of PhenylError.
 */
export function createError(
  error: $Supertype<Error | PhenylError | string>,
  _type?: ?PhenylErrorType,
  defaultLocation?: ErrorLocation = 'local'): $Subtype<PhenylError> & Error {

  // String to
  if (typeof error === 'string') {
    return createError(new Error(error), _type, defaultLocation)
  }
  const e = (error instanceof Error) ? error : new Error(error.message)
  if (error.stack) e.stack = error.stack
  // $FlowIssue(Error-can-have-prop)
  e.ok = 0
  // $FlowIssue(Error-can-have-prop)
  e.at = error.at || defaultLocation
  // $FlowIssue(Error-can-have-prop)
  e.type = error.type || _type || guessErrorTypes[e.at](e)
  // $FlowIssue(Error-can-have-prop)
  if (e.toJSON == null) {
    Object.defineProperty(e, 'toJSON', {
      // $FlowIssue(at-is-ErrorLocation)
      value: toJSONs[e.at],
    })
  }
  // $FlowIssue(compatible)
  return e
}

/**
 * Create a ServerError (Error in Node.js).
 */
export function createServerError(error: $Supertype<Error | ServerError | string>, _type?: ServerErrorType): $Subtype<ServerError> & Error {
  return createError(error, _type, 'server')
}

/**
 * Create a LocalError (Error in browser, React Native, etc...).
 */
export function createLocalError(error: $Supertype<Error | ServerError | string>, _type?: LocalErrorType): $Subtype<LocalError> & Error {
  return createError(error, _type, 'local')
}
