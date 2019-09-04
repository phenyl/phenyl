import { ObjectMap, Key } from "./utils";
import { CustomResultObject, ExtraParams, ExtraResult } from "./extra";
import { GeneralTypeMap } from "./type-map";

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
