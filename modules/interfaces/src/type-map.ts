import { Entity } from "./entity";
import { Key, ObjectMap } from "./utils";
import { Session } from "./session";
import { EntityRequestMethodName, AuthRequestMethodName } from "./request-data";

type MethodName = EntityRequestMethodName | AuthRequestMethodName;
type MethodNameTypeMap = {
  find: "read";
  findOne: "read";
  get: "read";
  getByIds: "read";
  pull: "read";
  insertOne: "create";
  insertMulti: "create";
  insertAndGet: "create";
  insertAndGetMulti: "create";
  updateById: "update";
  updateMulti: "update";
  updateAndGet: "update";
  updateAndFetch: "update";
  push: "update";
  delete: "delete";
  login: "auth";
  logout: "auth";
};

type ExtraParams = ObjectMap;
type ExtraResult = ObjectMap;
type CustomResultObject = ObjectMap & { extra?: undefined };

/**
 * This type includes all the types in API.
 * - entities contains Entity types.
 * - customQueries contains params and result of each custom query.
 * - customCommands contains params and result of each custom command.
 * - auths contains credential and option of each user entity.
 *
 * Library users implement concrete TypeMap of his or her own API like the following example.
 *
 *    interface MyTypeMap extends GeneralTypeMap {
 *      entities: {
 *        member: {
 *          request: { id: string; name: string };
 *          response: { id: string; name: string };
 *          extraParams: { find: { externalId: string } },
 *          extraResult: { find: { externalEntity: Entity } },
 *        };
 *        message: {
 *          request: {
 *            id: string;
 *            body: string;
 *            ...
 *          };
 *          response: {
 *            id: string;
 *            body: string;
 *            ...
 *          };
 *        };
 *      };
 *      customQueries: {
 *        countMessagesOfMember: {
 *          params: { memberId: string };
 *          result: { count: number };
 *          extraResult: { foo: number };
 *        };
 *        getCurrentVersion: {
 *          // params: {} // optional
 *          result: { version: string };
 *        };
 *      };
 *      customCommands: {
 *        register: { params: { name: string }; result: { ok: 1 } };
 *      };
 *      auths: {
 *        member: {
 *          credentials: { email: string; password: string };
 *          // session: {} // optional
 *        };
 *      };
 *    }
 */

export interface GeneralTypeMap {
  entities: GeneralEntityRestInfoMap;
  customQueries: GeneralCustomMap;
  customCommands: GeneralCustomMap;
  auths: GeneralAuthCommandMap;
}

export interface GeneralEntityMap {
  [entityName: string]: Entity;
}

export type EntityExtraParamsMap = { [MN in MethodName]?: ExtraParams } & {
  common?: ExtraParams;
  create?: ExtraParams;
  read?: ExtraParams;
  update?: ExtraParams;
  auth?: ExtraParams;
};

export type EntityExtraResultMap = { [MN in MethodName]?: ExtraResult } & {
  common?: ExtraResult;
  create?: ExtraParams;
  read?: ExtraParams;
  update?: ExtraParams;
  auth?: ExtraParams;
};

/**
 * REST API information of an entity.
 *
 * ### Properties
 * - request: Request form of entity.
 * - response: Response form of entity.
 * - extraParams: Extra parameters for request.
 * - extraResult: Extra result for response.
 *
 * Request and Response may have different types, for example, when making an authorization
 * request, a request of entity will need an `name`, `id`, and `password`, but response entity will only contain `name` and `id`.
 * In such cases, you will need to provide different types to request and response entities.
 *
 */
export type DetailedEntityRestInfo = {
  request: Entity;
  response: Entity;
  extraParams?: EntityExtraParamsMap;
  extraResult?: EntityExtraResultMap;
};

export type SimpleEntityRestInfo = {
  type: Entity;
  extraParams?: EntityExtraParamsMap;
  extraResult?: EntityExtraResultMap;
};

/**
 *  Deprecated. Use `SimpleEntityRestInfo`.
 */
export type ReqRes<Treq extends Entity, Tres extends Entity = Treq> = {
  request: Treq;
  response: Tres;
};

export type GeneralEntityRestInfo =
  | DetailedEntityRestInfo
  | SimpleEntityRestInfo;

/**
 * Key-value map of entities.
 * - Key: name of entity
 * - Value: type of its entity
 *
 * Library users implement concrete EntityMap in TypeMap.
 * See description of TypeMap.
 */
export interface GeneralEntityRestInfoMap {
  [entityName: string]: GeneralEntityRestInfo;
}

/**
 * Key-value map of custom queries/commands.
 * - Key: name of custom query/command
 * - Value: params and result of each query/command
 *
 * Library users implement concrete CustomMap in TypeMap.
 * Both "params" and "result" are optional and "Object" is set by default if not set in TypeMap.
 * See description of TypeMap.
 */
export interface GeneralCustomMap {
  [name: string]: GeneralCustomInOut;
}

/**
 * Key-value map of custom queries.
 * - Key: name of custom query
 * - Value: params and result of each query
 *
 * Library users implement concrete CustomMap in TypeMap.
 * Both "params" and "result" are optional and "Object" is set by default if not set in TypeMap.
 * See description of TypeMap.
 */
export type GeneralCustomQueryMap = GeneralCustomMap;

/**
 * Key-value map of custom commands.
 * - Key: name of custom command
 * - Value: params and result of each command
 *
 * Library users implement concrete CustomMap in TypeMap.
 * Both "params" and "result" are optional and "Object" is set by default if not set in TypeMap.
 * See description of TypeMap.
 */
export type GeneralCustomCommandMap = GeneralCustomMap;

type GeneralCustomInOut = {
  params?: ObjectMap;
  result?: CustomResultObject;
  extraParams?: ExtraParams;
  extraResult?: ExtraResult;
};

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
 * Key-value map of entities in given TypeMap.
 * - Key: name of entity
 * - Value: types of given entity's request and response
 */
export type EntityRestInfoMapOf<TM extends GeneralTypeMap> = TM["entities"];

/**
 * Key-value map of entities in given TypeMap.
 * - Key: name of entity
 * - Value: type of given entity's request
 */
export type RequestEntityMapOf<TM extends GeneralTypeMap> = {
  [K in Key<TM["entities"]>]: Request<TM["entities"][K]>
};

/**
 * Key-value map of entities in given TypeMap.
 * - Key: name of entity
 * - Value: type of given entity's response
 */
export type ResponseEntityMapOf<TM extends GeneralTypeMap> = {
  [K in Key<TM["entities"]>]: Response<TM["entities"][K]>
};

/**
 * EntityRestInfo of given entity name in given TypeMap.
 */
export type EntityRestInfoOf<
  TM extends GeneralTypeMap,
  EN extends Key<TM["entities"]>
> = EntityRestInfo<TM["entities"], EN>;

export type EntityRestInfo<
  EM extends GeneralEntityRestInfoMap,
  EN extends Key<EM>
> = EM[EN];

/**
 * Request Entity of given entity name in given TypeMap.
 */
export type RequestEntityOf<
  TM extends GeneralTypeMap,
  EN extends Key<TM["entities"]>
> = RequestEntity<TM["entities"], EN>;

export type RequestEntity<
  EM extends GeneralEntityRestInfoMap,
  EN extends Key<EM>
> = Request<EM[EN]>;

/**
 * Response Entity of given entity name in given TypeMap.
 */
export type ResponseEntityOf<
  TM extends GeneralTypeMap,
  EN extends Key<TM["entities"]>
> = ResponseEntity<TM["entities"], EN>;

export type ResponseEntity<
  EM extends GeneralEntityRestInfoMap,
  EN extends Key<EM>
> = Response<EM[EN]>;

/**
 * Extra params of given entity name and given method name in given TypeMap.
 */
export type EntityExtraParamsOf<
  TM extends GeneralTypeMap,
  EN extends Key<TM["entities"]>,
  MN extends EntityRequestMethodName
> = EntityExtraParams<TM["entities"], EN, MN>;

type ObjKeyDefault<O, K, D> = K extends keyof O
  ? (O[K] extends D ? Exclude<O[K], undefined> : D)
  : D;

export type EntityExtra<
  EEPM extends EntityExtraParamsMap,
  MN extends EntityRequestMethodName,
  D
> = ObjKeyDefault<EEPM, MN, D> &
  ObjKeyDefault<EEPM, MethodNameTypeMap[MN], D> &
  ObjKeyDefault<EEPM, "common", D>;

export type EntityExtraParams<
  EM extends GeneralEntityRestInfoMap,
  EN extends Key<EM>,
  MN extends EntityRequestMethodName
> = EM[EN]["extraParams"] extends EntityExtraParamsMap
  ? EntityExtra<EM[EN]["extraParams"], MN, ExtraParams>
  : ExtraParams;

/**
 * Extra response result of given entity name and given method name in given TypeMap.
 */
export type EntityExtraResultOf<
  TM extends GeneralTypeMap,
  EN extends Key<TM["entities"]>,
  MN extends EntityRequestMethodName
> = EntityExtraResult<TM["entities"], EN, MN>;

export type EntityExtraResult<
  EM extends GeneralEntityRestInfoMap,
  EN extends Key<EM>,
  MN extends EntityRequestMethodName
> = EM[EN]["extraResult"] extends EntityExtraResultMap
  ? EntityExtra<EM[EN]["extraResult"], MN, ExtraResult>
  : ExtraResult;

/**
 * Name of entities in given TypeMap.
 */
export type EntityNameOf<TM extends GeneralTypeMap> = Key<TM["entities"]>;

/**
 * Key-value map of custom query settings in given TypeMap.
 * - Key: name of custom query
 * - Value: setting
 */
export type CustomQueryMapOf<TM extends GeneralTypeMap> = TM["customQueries"];

/**
 * Pair of params and result of given query command name in given TypeMap.
 */
export type CustomQueryOf<
  TM extends GeneralTypeMap,
  QN extends Key<TM["customQueries"]>
> = TM["customQueries"][QN];

/**
 * Name of custom queries in given TypeMap.
 */
export type CustomQueryNameOf<TM extends GeneralTypeMap> = Key<
  TM["customQueries"]
>;

/**
 * Params of given custom query name in given TypeMap.
 * If params is not set, parsed as `ObjectMap`.
 */
export type CustomQueryParamsOf<
  TM extends GeneralTypeMap,
  QN extends Key<TM["customQueries"]>
> = CustomQueryParams<TM["customQueries"], QN>;

/**
 * Params of given custom query name in given CustomQueryMap.
 * If params is not set, parsed as `ObjectMap`.
 */
export type CustomQueryParams<
  QM extends GeneralCustomMap,
  QN extends Key<QM>
> = CustomParams<QM, QN>;

/**
 * Result of given custom query name in given TypeMap.
 * If result is not set, parsed as `CustomQueryResultObject`.
 */
export type CustomQueryResultValueOf<
  TM extends GeneralTypeMap,
  QN extends Key<TM["customQueries"]>
> = CustomQueryResultValue<TM["customQueries"], QN>;

/**
 * Result of given custom query name in given CustomQueryMap.
 * If result is not set, parsed as `CustomQueryResultObject`.
 */
export type CustomQueryResultValue<
  QM extends GeneralCustomMap,
  QN extends Key<QM>
> = CustomResultValue<QM, QN>;

/**
 * Extra params of given custom query name in given TypeMap.
 * If extraParams is not set, parsed as `ObjectMap`.
 */
export type CustomQueryExtraParamsOf<
  TM extends GeneralTypeMap,
  QN extends Key<TM["customQueries"]>
> = CustomQueryExtraParams<TM["customQueries"], QN>;

/**
 * Extra params of given custom query name in given CustomQueryMap.
 * If extraParams is not set, parsed as `ObjectMap`.
 */
export type CustomQueryExtraParams<
  QM extends GeneralCustomMap,
  QN extends Key<QM>
> = CustomExtraParams<QM, QN>;

/**
 * Extra result of given custom query name in given TypeMap.
 * If extraResult is not set, parsed as `ObjectMap`.
 */
export type CustomQueryExtraResultOf<
  TM extends GeneralTypeMap,
  QN extends Key<TM["customQueries"]>
> = CustomQueryExtraResult<TM["customQueries"], QN>;

/**
 * Extra result of given custom query name in given CustomQueryMap.
 * If result is not set, parsed as `ObjectMap`.
 */
export type CustomQueryExtraResult<
  QM extends GeneralCustomMap,
  QN extends Key<QM>
> = CustomExtraResult<QM, QN>;

/**
 * Key-value map of custom command settings in given TypeMap.
 * - Key: name of custom command
 * - Value: setting
 */
export type CustomCommandMapOf<
  TM extends GeneralTypeMap
> = TM["customCommands"];

/**
 * Pair of params and result of given custom command name in given TypeMap.
 */
export type CustomCommandOf<
  TM extends GeneralTypeMap,
  CN extends Key<TM["customCommands"]>
> = TM["customCommands"][CN];

/**
 * Name of custom commands in given TypeMap.
 */
export type CustomCommandNameOf<TM extends GeneralTypeMap> = Key<
  TM["customCommands"]
>;

/**
 * Params of given custom command name in given TypeMap.
 * If params is not set, parsed as `ObjectMap`.
 */
export type CustomCommandParamsOf<
  TM extends GeneralTypeMap,
  CN extends Key<TM["customCommands"]>
> = CustomCommandParams<TM["customCommands"], CN>;

/**
 * Params of given custom command name in given CustomCommandMap.
 * If params is not set, parsed as `ObjectMap`.
 */
export type CustomCommandParams<
  CM extends GeneralCustomMap,
  CN extends Key<CM>
> = CustomParams<CM, CN>;

/**
 * Result of given custom command name in given TypeMap.
 * If params is not set, parsed as `CustomCommandResultObject`.
 */
export type CustomCommandResultValueOf<
  TM extends GeneralTypeMap,
  CN extends Key<TM["customCommands"]>
> = CustomCommandResultValue<TM["customCommands"], CN>;

/**
 * Result of given custom command name in given CustomCommandMap.
 * If params is not set, parsed as `CustomCommandResultObject`.
 */
export type CustomCommandResultValue<
  CM extends GeneralCustomMap,
  CN extends Key<CM>
> = CustomResultValue<CM, CN>;

/**
 * Extra params of given custom command name in given TypeMap.
 * If extraParams is not set, parsed as `ObjectMap`.
 */
export type CustomCommandExtraParamsOf<
  TM extends GeneralTypeMap,
  CN extends Key<TM["customCommands"]>
> = CustomCommandExtraParams<TM["customCommands"], CN>;

/**
 * Extra params of given custom command name in given CustomCommandMap.
 * If extraParams is not set, parsed as `ObjectMap`.
 */
export type CustomCommandExtraParams<
  CM extends GeneralCustomMap,
  CN extends Key<CM>
> = CustomExtraParams<CM, CN>;

/**
 * Extra result of given custom command name in given TypeMap.
 * If extraResult is not set, parsed as `ObjectMap`.
 */
export type CustomCommandExtraResultOf<
  TM extends GeneralTypeMap,
  CN extends Key<TM["customCommands"]>
> = CustomCommandExtraResult<TM["customCommands"], CN>;

/**
 * Extra result of given custom command name in given CustomCommandMap.
 * If result is not set, parsed as `ObjectMap`.
 */
export type CustomCommandExtraResult<
  CM extends GeneralCustomMap,
  CN extends Key<CM>
> = CustomExtraResult<CM, CN>;

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

type CustomParams<
  T extends GeneralCustomMap,
  N extends Key<T>
> = "params" extends Key<T[N]>
  ? T[N]["params"] extends ObjectMap
    ? Exclude<T[N]["params"], undefined>
    : ObjectMap
  : ObjectMap; // If "params" is not set, set ObjectMap.

type CustomResultValue<
  T extends GeneralCustomMap,
  N extends Key<T>
> = "result" extends Key<T[N]>
  ? T[N]["result"] extends CustomResultObject
    ? Exclude<T[N]["result"], undefined>
    : CustomResultObject
  : CustomResultObject; // If "result" is not set, set CustomResultObject.

type CustomExtraParams<
  T extends GeneralCustomMap,
  N extends Key<T>
> = "extraParams" extends Key<T[N]>
  ? T[N]["extraParams"] extends ExtraParams
    ? Exclude<T[N]["extraParams"], undefined>
    : ExtraParams
  : ExtraParams;

type CustomExtraResult<
  T extends GeneralCustomMap,
  N extends Key<T>
> = "extraResult" extends Key<T[N]>
  ? T[N]["extraResult"] extends ExtraResult
    ? Exclude<T[N]["extraResult"], undefined>
    : ExtraResult
  : ExtraResult;

type Request<T extends GeneralEntityRestInfo> = T extends DetailedEntityRestInfo
  ? T["request"]
  : T extends SimpleEntityRestInfo
  ? T["type"]
  : Entity;

type Response<
  T extends GeneralEntityRestInfo
> = T extends DetailedEntityRestInfo
  ? T["response"]
  : T extends SimpleEntityRestInfo
  ? T["type"]
  : Entity;
