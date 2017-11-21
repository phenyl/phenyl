// @flow
import type {
  ServerError,
  ServerErrorType,
  LocalError,
  LocalErrorType,
} from 'phenyl-interfaces'

export class PhenylServerError extends Error implements ServerError {
  type: ServerErrorType
  ok: 0
  at: 'server'

  constructor(message: string, type?: ServerErrorType) {
    super(message)
    this.type = type || 'InternalServer'
    this.ok = 0
    this.at = 'server'
  }

  toJSON(): ServerError {
    return {
      ok: 0,
      at: 'server',
      type: this.type,
      message: this.message,
      stack: this.stack
    }
  }
}

export class PhenylLocalError extends Error implements LocalError {
  type: LocalErrorType
  at: 'local'

  constructor(message: string, type?: LocalErrorType) {
    super(message)
    this.type = type || 'CodeProblem'
    this.at = 'local'
  }

  toJSON(): LocalError {
    return {
      at: 'local',
      type: this.type,
      message: this.message,
      stack: this.stack
    }
  }
}

/**
 * Create a ServerError (Error in Node.js).
 */
export function createServerError(error: $Supertype<Error | ServerError | string>, _type?: ServerErrorType): PhenylServerError {
  if (typeof error === 'string') {
    return createServerError(new Error(error), _type)
  }
  // $FlowIssue(type-is-compatible)
  const type: ServerErrorType = error.type || _type || guessServerErrorType(error)
  const serverError = new PhenylServerError(error.message, type)
  if (error.stack) serverError.stack = error.stack
  return serverError
}

/**
 * Create a LocalError (Error in browser, React Native, etc...).
 */
export function createLocalError(error: $Supertype<Error | ServerError | string>, _type?: LocalErrorType): PhenylLocalError {
  if (typeof error === 'string') {
    return createLocalError(new Error(error), _type)
  }
  // $FlowIssue(type-is-compatible)
  const type: LocalErrorType = error.type || _type || guessLocalErrorType(error)
  const localError = new PhenylLocalError(error.message, type)
  if (error.stack) localError.stack = error.stack
  return localError
}

function guessServerErrorType(error: Error): ServerErrorType {
  if (error.constructor.name === 'Error') {
    return 'BadRequest'
  }
  return 'InternalServer'
}


function guessLocalErrorType(error: Error): LocalErrorType {
  if (error.constructor.name === 'Error') {
    return 'InvalidData'
  }
  return 'CodeProblem'
}
