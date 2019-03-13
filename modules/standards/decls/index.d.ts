import {
  LoginCommand,
  Session,
  GeneralRequestData,
  GeneralResponseData,
  GeneralReqResEntityMap
} from '@phenyl/interfaces'

// @TODO: should we put those types into @phenyl/interfaces?
type RestApiExecution = (
    reqData: GeneralRequestData,
    session: Session | null | undefined
) => Promise<GeneralResponseData>
export type AuthSetting = { credentials: Object, options: Object }
export type LoginCommandOf<A extends AuthSetting, N extends string> = LoginCommand<N, A['credentials']>
export type EncryptFunction<A extends AuthSetting> = (str: A["credentials"], options?: Object) => string
