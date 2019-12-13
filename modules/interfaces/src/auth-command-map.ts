import { GeneralTypeMap } from "./type-map";
import { Key } from "./utils";
import {
  EntityNameOf,
  GeneralEntityRestInfoMap,
  Request,
  Response,
  EntityRestInfoMapOf,
  GeneralEntityRestInfo,
  EntityRestInfo
} from "./entity-rest-info-map";
import { Session } from "./session";

/**
 * Key-value map of user auth settings.
 * - Key: entityName
 * - Value: User auth setting
 *
 * Library users implement concrete CustomMap in TypeMap.
 * "session" is optional and "Object" is set by default if not set in TypeMap.
 * See description of TypeMap.
 */
export type GeneralAuthCommandMap = {
  [name: string]: GeneralAuthSetting;
};
type GeneralAuthSetting = {
  credentials: Object;
  session?: Object;
};

/**
 * Key-value map of user auth settings in given TypeMap.
 * - Key: user entityName
 * - Value: User auth setting
 */
export type AuthCommandMapOf<TM extends GeneralTypeMap> = TM["auths"];

/**
 * Auth command params of given user entity name in given TypeMap.
 */
export type AuthCommandOf<
  TM extends GeneralTypeMap,
  EN extends Key<TM["auths"]>
> = TM["auths"][EN];

/**
 * Name of auths in given TypeMap.
 */
export type AuthEntityNameOf<TM extends GeneralTypeMap> = Key<TM["auths"]>;

/**
 * Name of user entities in given TypeMap.
 * It's an intersection of AuthEntityNameOf<TM> & EntityNameOf<TM>,
 */
export type UserEntityNameOf<TM extends GeneralTypeMap> = AuthEntityNameOf<TM> &
  EntityNameOf<TM>;

/**
 * Name of non-user entities in given TypeMap.
 * It's a subtraction of EntityNameOf<TM> from AuthEntityNameOf<TM>,
 */
export type NonUserEntityNameOf<TM extends GeneralTypeMap> = Exclude<
  EntityNameOf<TM>,
  AuthEntityNameOf<TM>
>;

/**
 * Credential values of given user entity name in given TypeMap.
 */
export type AuthCredentialsOf<
  TM extends GeneralTypeMap,
  EN extends Key<TM["auths"]>
> = AuthCredentials<AuthCommandMapOf<TM>, EN>;

/**
 * Credential values of given user entity name in given AuthCommandMap.
 */
export type AuthCredentials<
  AM extends GeneralAuthCommandMap,
  EN extends Key<AM>
> = AM[EN]["credentials"];

/**
 * Additional session values of given user entity name in given TypeMap.
 * If session is not set, parsed as "Object".
 */
export type AuthSessionOf<
  TM extends GeneralTypeMap,
  EN extends Key<TM["auths"]>
> = AuthSessions<AuthCommandMapOf<TM>, EN>;

/**
 * Additional session values of given user entity name in given TypeMap.
 * If session is not set, parsed as "Object".
 */
export type AuthSessions<
  AM extends GeneralAuthCommandMap,
  EN extends Key<AM>
> = "session" extends keyof AM[EN]
  ? AM[EN]["session"] extends Object
    ? AM[EN]["session"]
    : Object
  : Object;

type ValueOf<T> = T[keyof T];
/**
 * All possible sessions by given AuthCommandMap.
 */
export type AllSessions<AM extends GeneralAuthCommandMap> = ValueOf<
  {
    [EN in Key<AM>]: Session<
      EN,
      "session" extends keyof AM[EN]
        ? AM[EN]["session"] extends Object
          ? AM[EN]["session"]
          : Object
        : Object
    >
  }
>;

/**
 * Logined user type of given user entity name in given TypeMap.
 * If not given in AuthCommandMap, entity in EntityMap is selected.
 * If neither exist, parsed as "Object".
 */
export type ResponseAuthUserOf<
  TM extends GeneralTypeMap,
  EN extends Key<TM["auths"]>
> = ResponseAuthUser<AuthCommandMapOf<TM>, EN, EntityRestInfoMapOf<TM>>;

type EntityRestInfoOfAuth<
  AM extends GeneralAuthCommandMap,
  EN extends Key<AM>,
  EM extends GeneralEntityRestInfoMap = GeneralEntityRestInfoMap
> = EN extends Key<EM> ? EntityRestInfo<EM, EN> : GeneralEntityRestInfo;

/**
 * Logined user type of given user entity name in given AuthCommandMap.
 * If not given in AuthCommandMap, entity in given EntityMap(optional) is selected.
 * If neither exist, parsed as "Entity".
 */
export type AuthUserEntityRestInfo<
  AM extends GeneralAuthCommandMap,
  EN extends Key<AM>,
  EM extends GeneralEntityRestInfoMap = GeneralEntityRestInfoMap
> = EntityRestInfoOfAuth<AM, EN, EM>;

/**
 * Logined user type of given user entity name in given AuthCommandMap.
 * If not given in AuthCommandMap, entity in given EntityMap(optional) is selected.
 * If neither exist, parsed as "Entity".
 */
export type RequestAuthUser<
  AM extends GeneralAuthCommandMap,
  EN extends Key<AM>,
  EM extends GeneralEntityRestInfoMap = GeneralEntityRestInfoMap
> = Request<EntityRestInfoOfAuth<AM, EN, EM>>;

/**
 * Logined user type of given user entity name in given AuthCommandMap.
 * If not given in AuthCommandMap, entity in given EntityMap(optional) is selected.
 * If neither exist, parsed as "Entity".
 */
export type ResponseAuthUser<
  AM extends GeneralAuthCommandMap,
  EN extends Key<AM>,
  EM extends GeneralEntityRestInfoMap = GeneralEntityRestInfoMap
> = Response<EntityRestInfoOfAuth<AM, EN, EM>>;
