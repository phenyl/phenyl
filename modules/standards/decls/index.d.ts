import {
  LoginCommand,
  Session,
  GeneralRequestData,
  GeneralResponseData,
  GeneralReqResEntityMap
} from '@phenyl/interfaces'

// @TODO: should we put those types into @phenyl/interfaces?
export type RestApiExecution<T extends GeneralResponseData = GeneralResponseData> = (
    reqData: GeneralRequestData,
    session: Session | null | undefined
) => Promise<T>
export type AuthSetting = { credentials: Object, options: Object }
export type LoginCommandOf<A extends AuthSetting, N extends string> = LoginCommand<N, A['credentials']>
export type EncryptFunction<A extends AuthSetting = AuthSetting> = (str: A["credentials"], options?: Object) => string
