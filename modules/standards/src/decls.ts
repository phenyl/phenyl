import {
  LoginCommand,
  Session,
  GeneralUserEntityRequestData,
  GeneralUserEntityResponseData
} from "@phenyl/interfaces";

export type RestApiExecution = (
  reqData: GeneralUserEntityRequestData,
  session?: Session
) => Promise<GeneralUserEntityResponseData>;

export type AuthSetting = { credentials: Object; options: Object };
export type LoginCommandOf<
  A extends AuthSetting,
  N extends string
> = LoginCommand<N, A["credentials"]>;
export type EncryptFunction = (str: string, options?: Object) => string;
