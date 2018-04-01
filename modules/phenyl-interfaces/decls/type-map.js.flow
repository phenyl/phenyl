// @flow
import type {
  Entity,
  EntityName,
} from './entity.js.flow'

import type {
  LoginCommand,
} from './command.js.flow'

export type EntityMap = { [EntityName]: Entity }

export type CustomParams<T: CustomQueryMap | CustomCommandMap, N: $Keys<T>> = $ElementType<$ElementType<T, N>, 'params'>
export type CustomResult<T: CustomQueryMap | CustomCommandMap, N: $Keys<T>> = $ElementType<$ElementType<T, N>, 'result'>
export type AuthSetting = { credentials: Object, options: Object }
export type LoginCommandOf<A: AuthSetting, N: string> = LoginCommand<N, $ElementType<A, 'credentials'>, $ElementType<A, 'options'>>
export type AuthCommandMap = {
  [name: EntityName]: AuthSetting
}

export type AuthCredentials<T: AuthCommandMap, N: $Keys<T>> = $ElementType<$ElementType<T, N>, 'credentials'>
export type AuthOptions<T: AuthCommandMap, N: $Keys<T>> = $ElementType<$ElementType<T, N>, 'options'>

export type CustomSetting = { params: Object, result: Object }
export type CustomQueryMap = {
  [name: string]: CustomSetting
}


export type CustomCommandMap = {
  // name should be string or string literal
  [name: any]: { params: Object, result: Object }
}



export type TypeMap = {
  +entities: EntityMap,
  +customQueries: CustomQueryMap,
  +customCommands: CustomCommandMap,
  +auths: AuthCommandMap,
}

export type EntityMapOf<TM: TypeMap> = $ElementType<TM, 'entities'>
export type CustomQueryMapOf<TM: TypeMap> = $ElementType<TM, 'customQueries'>
export type CustomCommandMapOf<TM: TypeMap> = $ElementType<TM, 'customCommands'>
export type AuthCommandMapOf<TM: TypeMap> = $ElementType<TM, 'auths'>
export type AuthSettingOf<TM: TypeMap, N: string> = $ElementType<AuthCommandMapOf<TM>, N>
export type EntityOf<TM: TypeMap, N: string> = $ElementType<$ElementType<TM, 'entities'>, N>
export type CustomQueryOf<TM: TypeMap, N: string> = $ElementType<$ElementType<TM, 'customQueries'>, N>
export type CustomCommandOf<TM: TypeMap, N: string> = $ElementType<$ElementType<TM, 'customCommandsOf'>, N>
export type QueryParamsOf<TM: TypeMap, N: string> = $ElementType<$ElementType<$ElementType<TM, 'customQueries'>, N>, 'params'>
export type QueryResultOf<TM: TypeMap, N: string> = $ElementType<$ElementType<$ElementType<TM, 'customQueries'>, N>, 'result'>
export type CommandParamsOf<TM: TypeMap, N: string> = $ElementType<$ElementType<$ElementType<TM, 'customCommands'>, N>, 'params'>
export type CommandResultOf<TM: TypeMap, N: string> = $ElementType<$ElementType<$ElementType<TM, 'customCommands'>, N>, 'result'>
export type AuthCommandOf<TM: TypeMap, N: string> = $ElementType<$ElementType<TM, 'auths'>, N>
export type CredentialsOf<TM: TypeMap, N: string> = $ElementType<AuthCommandOf<TM, N>, 'credentials'>
export type OptionsOf<TM: TypeMap, N: string> = $ElementType<AuthCommandOf<TM, N>, 'options'>
export type EntityNameOf<TM: TypeMap> = $Keys<$ElementType<TM, 'entities'>>
export type CustomQueryNameOf<TM: TypeMap> = $Keys<$ElementType<TM, 'customQueries'>>
export type CustomCommandNameOf<TM: TypeMap> = $Keys<$ElementType<TM, 'customCommands'>>
export type UserEntityNameOf<TM: TypeMap> = $Keys<$ElementType<TM, 'auths'>> & EntityNameOf<TM>
