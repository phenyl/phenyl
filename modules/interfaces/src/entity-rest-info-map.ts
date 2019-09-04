import { EntityRequestMethodName, AuthRequestMethodName } from "./request-data";
import { Entity } from "./entity";
import { ExtraParams, ExtraResult } from "./extra";
import { GeneralTypeMap } from "./type-map";
import { Key } from "./utils";

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
  create?: ExtraResult;
  read?: ExtraResult;
  update?: ExtraResult;
  auth?: ExtraResult;
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
export type GeneralEntityRestInfo =
  | DetailedEntityRestInfo
  | SimpleEntityRestInfo;

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

export type Request<
  T extends GeneralEntityRestInfo
> = T extends DetailedEntityRestInfo
  ? T["request"]
  : T extends SimpleEntityRestInfo
  ? T["type"]
  : Entity;

export type Response<
  T extends GeneralEntityRestInfo
> = T extends DetailedEntityRestInfo
  ? T["response"]
  : T extends SimpleEntityRestInfo
  ? T["type"]
  : Entity;
