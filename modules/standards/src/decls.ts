import {
  LoginCommand,
  Session,
  UserEntityRequestData,
  GeneralReqResEntityMap,
  Key,
  Nullable,
  UserEntityResponseData
} from "@phenyl/interfaces";

export type RestApiExecution<
  M extends GeneralReqResEntityMap,
  EN extends Key<M>,
  Ereqres extends M[EN],
  C extends Object,
  S extends Object,
  SS extends Session<string, Object> = Session<string, Object>
> = (
  reqData: UserEntityRequestData<EN, Ereqres["response"], C>,
  session?: Nullable<SS>
) => Promise<UserEntityResponseData<EN, Ereqres["response"], S>>;

export type AuthSetting = { credentials: Object; options: Object };
export type LoginCommandOf<
  A extends AuthSetting,
  N extends string
> = LoginCommand<N, A["credentials"]>;
export type EncryptFunction<A extends AuthSetting = AuthSetting> = (
  str: A["credentials"],
  options?: Object
) => string;
