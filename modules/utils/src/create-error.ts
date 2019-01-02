import {
  ErrorDetail,
  ErrorLocation,
  LocalError,
  LocalErrorType,
  PhenylError,
  PhenylErrorType,
  ServerError,
  ServerErrorType
} from "@phenyl/interfaces";

const toJSONs = {
  server: function toServerErrorJSON(): ServerError {
    return {
      ok: 0,
      at: "server",
      // @ts-ignore
      type: this.type,
      // @ts-ignore
      message: this.message,
      // @ts-ignore
      stack: this.stack,
      // @ts-ignore
      detail: this.detail
    };
  },

  local: function toLocalErrorJSON(): LocalError {
    return {
      // @ts-ignore
      ok: 0,
      at: "local",
      // @ts-ignore
      type: this.type,
      // @ts-ignore
      message: this.message,
      // @ts-ignore
      stack: this.stack,
      // @ts-ignore
      detail: this.detail
    };
  }
};

const guessErrorTypes = {
  server: function guessServerErrorType(error: Error): ServerErrorType {
    if (error.constructor === Error) {
      return "BadRequest";
    }

    return "InternalServer";
  },
  local: function guessLocalErrorType(error: Error): LocalErrorType {
    if (error.constructor === Error) {
      return "InvalidData";
    }

    return "CodeProblem";
  }
  /**
   * Create a PhenylError.
   * Phenyl error is instanceof Error.
   * Phenyl error implements interface of PhenylError.
   */
};

export function createError(
  error: Error | PhenylError | string | ErrorDetail,
  _type?: PhenylErrorType | null,
  defaultLocation: ErrorLocation = "local"
): PhenylError & Error {
  if (typeof error === "string") {
    return createError(new Error(error), _type, defaultLocation);
  }

  const e = error instanceof Error ? error : new Error(error.message);

  // @ts-ignore
  if (error.stack) e.stack = error.stack;

  // @ts-ignore
  e.ok = 0;

  // @ts-ignore
  e.at = error.at || defaultLocation;

  // @ts-ignore
  e.type = error.type || _type || guessErrorTypes[e.at](e);

  // @ts-ignore
  if (e.toJSON == null) {
    Object.defineProperty(e, "toJSON", {
      // @ts-ignore
      value: toJSONs[e.at]
    });
  }

  // @ts-ignore
  if (error.detail) e.detail = error.detail;

  // @ts-ignore
  return e;
}

/**
 * Create a ServerError (Error in Node.js).
 */
export function createServerError(
  error: Error | ServerError | string,
  _type?: ServerErrorType
): ServerError & Error {
  // @ts-ignore
  return createError(error, _type, "server");
}

/**
 * Create a LocalError (Error in browser, React Native, etc...).
 */
export function createLocalError(
  error: Error | ServerError | string,
  _type?: LocalErrorType
): LocalError & Error {
  // @ts-ignore
  return createError(error, _type, "local");
}
