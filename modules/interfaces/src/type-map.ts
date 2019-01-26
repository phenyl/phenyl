import { Entity } from "./entity";
import { Key } from "./utils";
import { Session } from "./session";

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
 *        member: { id: string; name: string };
 *        message: {
 *          id: string;
 *          body: string;
 *          ...
 *        };
 *      };
 *      customQueries: {
 *        countMessagesOfMember: {
 *          params: { memberId: string };
 *          result: { count: number };
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
  entities: GeneralEntityMap;
  customQueries: GeneralCustomMap;
  customCommands: GeneralCustomMap;
  auths: GeneralAuthCommandMap;
}

/**
 * Key-value map of entities.
 * - Key: name of entity
 * - Value: type of its entity
 *
 * Library users implement concrete EntityMap in TypeMap.
 * See description of TypeMap.
 */
export interface GeneralEntityMap {
  [entityName: string]: ReqRes<Entity, Entity>;
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
  params?: Object;
  result?: Object;
};

/**
 * Key-value map of auth settings.
 * - Key: entityName
 * - Value: Auth setting
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
 * - Value: type of its narrow and broad entity
 */
export type ReqResEntityMapOf<TM extends GeneralTypeMap> = TM["entities"];

/**
 * Key-value map of entities in given TypeMap.
 * - Key: name of entity
 * - Value: type of its narrow entity
 */
export type ResponseEntityMapOf<TM extends GeneralTypeMap> = {
  [K in Key<TM["entities"]>]: Narrow<TM["entities"][K]>
};

/**
 * Key-value map of entities in given TypeMap.
 * - Key: name of entity
 * - Value: type of its narrow entity
 */
export type RequestEntityMapOf<TM extends GeneralTypeMap> = {
  [K in Key<TM["entities"]>]: Broad<TM["entities"][K]>
};

/**
 * Entity of given entity name in given TypeMap.
 */
export type ReqResEntityOf<
  TM extends GeneralTypeMap,
  EN extends Key<TM["entities"]>
> = ReqResEntity<TM["entities"], EN>;

export type ReqResEntity<
  EM extends GeneralEntityMap,
  EN extends Key<EM>
> = EM[EN];

/**
 * Entity of given entity name in given TypeMap.
 */
export type ResponseEntityOf<
  TM extends GeneralTypeMap,
  EN extends Key<TM["entities"]>
> = ResponseEntity<TM["entities"], EN>;

export type ResponseEntity<
  EM extends GeneralEntityMap,
  EN extends Key<EM>
> = Narrow<EM[EN]>;

/**
 * Entity of given entity name in given TypeMap.
 */
export type RequestEntityOf<
  TM extends GeneralTypeMap,
  EN extends Key<TM["entities"]>
> = RequestEntity<TM["entities"], EN>;

export type RequestEntity<
  EM extends GeneralEntityMap,
  EN extends Key<EM>
> = Broad<EM[EN]>;

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
 * If params is not set, parsed as "Object".
 */
export type CustomQueryParamsOf<
  TM extends GeneralTypeMap,
  QN extends Key<TM["customQueries"]>
> = CustomQueryParams<TM["customQueries"], QN>;

/**
 * Params of given custom query name in given CustomQueryMap.
 * If params is not set, parsed as "Object".
 */
export type CustomQueryParams<
  QM extends GeneralCustomMap,
  QN extends Key<QM>
> = CustomParams<QM, QN>;

/**
 * Result of given custom query name in given TypeMap.
 * If result is not set, parsed as "Object".
 */
export type CustomQueryResultValueOf<
  TM extends GeneralTypeMap,
  QN extends Key<TM["customQueries"]>
> = CustomQueryResultValue<TM["customQueries"], QN>;

/**
 * Result of given custom query name in given CustomQueryMap.
 * If params is not set, parsed as "Object".
 */
export type CustomQueryResultValue<
  QM extends GeneralCustomMap,
  QN extends Key<QM>
> = CustomResultValue<QM, QN>;

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
 * If params is not set, parsed as "Object".
 */
export type CustomCommandParamsOf<
  TM extends GeneralTypeMap,
  CN extends Key<TM["customCommands"]>
> = CustomCommandParams<TM["customCommands"], CN>;

/**
 * Params of given custom command name in given CustomCommandMap.
 * If params is not set, parsed as "Object".
 */
export type CustomCommandParams<
  CM extends GeneralCustomMap,
  CN extends Key<CM>
> = CustomParams<CM, CN>;

/**
 * Result of given custom command name in given TypeMap.
 * If result is not set, parsed as "Object".
 */
export type CustomCommandResultValueOf<
  TM extends GeneralTypeMap,
  CN extends Key<TM["customCommands"]>
> = CustomCommandResultValue<TM["customCommands"], CN>;

/**
 * Result of given custom command name in given CustomCommandMap.
 * If params is not set, parsed as "Object".
 */
export type CustomCommandResultValue<
  CM extends GeneralCustomMap,
  CN extends Key<CM>
> = CustomResultValue<CM, CN>;

/**
 * Key-value map of auth settings in given TypeMap.
 * - Key: entityName
 * - Value: Auth setting
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
> = ResponseAuthUser<AuthCommandMapOf<TM>, EN, ReqResEntityMapOf<TM>>;

type EntityOfAuth<
  AM extends GeneralAuthCommandMap,
  EN extends Key<AM>,
  EM extends GeneralEntityMap = GeneralEntityMap
> = EN extends Key<EM> ? ReqResEntity<EM, EN> : ReqRes<Entity>;

/**
 * Logined user type of given user entity name in given AuthCommandMap.
 * If not given in AuthCommandMap, entity in given EntityMap(optional) is selected.
 * If neither exist, parsed as "Entity".
 */
export type ReqResAuthUser<
  AM extends GeneralAuthCommandMap,
  EN extends Key<AM>,
  EM extends GeneralEntityMap = GeneralEntityMap
> = EntityOfAuth<AM, EN, EM>;

/**
 * Logined user type of given user entity name in given AuthCommandMap.
 * If not given in AuthCommandMap, entity in given EntityMap(optional) is selected.
 * If neither exist, parsed as "Entity".
 */
export type ResponseAuthUser<
  AM extends GeneralAuthCommandMap,
  EN extends Key<AM>,
  EM extends GeneralEntityMap = GeneralEntityMap
> = Narrow<EntityOfAuth<AM, EN, EM>>;

/**
 * Logined user type of given user entity name in given AuthCommandMap.
 * If not given in AuthCommandMap, entity in given EntityMap(optional) is selected.
 * If neither exist, parsed as "Entity".
 */
export type RequestAuthUser<
  AM extends GeneralAuthCommandMap,
  EN extends Key<AM>,
  EM extends GeneralEntityMap = GeneralEntityMap
> = Broad<EntityOfAuth<AM, EN, EM>>;

type CustomParams<
  T extends GeneralCustomMap,
  N extends Key<T>
> = "params" extends Key<T[N]>
  ? T[N]["params"] extends Object
    ? Exclude<T[N]["params"], undefined>
    : Object
  : Object; // If "params" is not set, set Object.

type CustomResultValue<
  T extends GeneralCustomMap,
  N extends Key<T>
> = "result" extends Key<T[N]>
  ? T[N]["result"] extends Object
    ? Exclude<T[N]["result"], undefined>
    : Object
  : Object; // If "result" is not set, set Object.

export type ReqRes<
Trequest extends Entity,
Tresponse extends Entity = Trequest
> = {request: Trequest, response: Tresponse} ;

type Narrow<T extends ReqRes<Entity>> = T['response'];
type Broad<T extends ReqRes<Entity>> = T['request'];
