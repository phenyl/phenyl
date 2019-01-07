export type PhenylErrorType = ServerErrorType | LocalErrorType;

export type ServerErrorType =
  | "BadRequest"
  | "Unauthorized"
  | "Forbidden"
  | "NotFound"
  | "InternalServer";
export type LocalErrorType = "NetworkFailed" | "InvalidData" | "CodeProblem";

export type PhenylError<D> = ServerError<D> | LocalError<D>;

export type ErrorLocation = "server" | "local";

export type ErrorDetail<D extends Object> = {
  message: string;
  detail: D;
};

export type ServerError<D = any> = {
  ok: 0;
  at: "server";
  type: ServerErrorType;
  message: string;
  stack?: string;
  toJSON?: () => ServerError<D>;
} & (D extends Object ? { detail: D } : {});

export type LocalError<D = any> = {
  ok: 0;
  at: "local";
  type: LocalErrorType;
  message: string;
  stack?: string;
  toJSON?: () => LocalError<D>;
} & (D extends Object ? { detail: D } : {});
