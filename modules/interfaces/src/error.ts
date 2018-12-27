export type PhenylErrorType = ServerErrorType | LocalErrorType;

export type ServerErrorType =
  | "BadRequest"
  | "Unauthorized"
  | "Forbidden"
  | "NotFound"
  | "InternalServer";
export type LocalErrorType = "NetworkFailed" | "InvalidData" | "CodeProblem";

export type PhenylError = ServerError | LocalError;

export type ErrorLocation = "server" | "local";

export type ErrorDetail = {
  message: string;
  detail: Object;
};

export interface ServerError {
  ok: 0;
  at: "server";
  type: ServerErrorType;
  message: string;
  stack?: string;
  detail?: Object;
}

export interface LocalError {
  at: "local";
  type: LocalErrorType;
  message: string;
  stack?: string;
  detail?: Object;
}
