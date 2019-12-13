import {
  DeleteCommand,
  IdUpdateCommand,
  MultiInsertCommand,
  MultiUpdateCommand,
  PushCommand,
  SingleInsertCommand,
  GeneralSingleInsertCommand,
  GeneralMultiInsertCommand,
  GeneralIdUpdateCommand,
  GeneralMultiUpdateCommand,
  GeneralPushCommand,
  GeneralDeleteCommand
} from "./command";
import {
  DeleteCommandResult,
  GetCommandResult,
  IdUpdateCommandResult,
  MultiInsertCommandResult,
  MultiUpdateCommandResult,
  MultiValuesCommandResult,
  PushCommandResult,
  SingleInsertCommandResult,
  GeneralSingleInsertCommandResult,
  GeneralMultiInsertCommandResult,
  GeneralGetCommandResult,
  GeneralMultiValuesCommandResult,
  GeneralIdUpdateCommandResult,
  GeneralPushCommandResult,
  GeneralDeleteCommandResult
} from "./command-result";
import {
  IdQuery,
  IdsQuery,
  PullQuery,
  WhereQuery,
  GeneralWhereQuery,
  GeneralIdsQuery,
  GeneralIdQuery,
  GeneralPullQuery
} from "./query";
import {
  PullQueryResult,
  QueryResult,
  SingleQueryResult,
  GeneralQueryResult,
  GeneralSingleQueryResult,
  GeneralPullQueryResult
} from "./query-result";

import { Key } from "./utils";
import { KvsClient } from "./kvs-client";
import { PreEntity } from "./entity";
import { DbClient, GeneralDbClient } from "./db-client";
import { GeneralEntityMap, ResponseEntityMapOf } from "./entity-rest-info-map";
import {
  GeneralAuthCommandMap,
  AuthCommandMapOf,
  AllSessions
} from "./auth-command-map";
import { GeneralTypeMap } from "./type-map";

/**
 * A common interface for client-side and server-side client to access to entities.
 */
export interface BaseEntityClient {
  find(query: GeneralWhereQuery): Promise<GeneralQueryResult>;

  findOne(query: GeneralWhereQuery): Promise<GeneralSingleQueryResult>;

  get(query: GeneralIdQuery): Promise<GeneralSingleQueryResult>;

  getByIds(query: GeneralIdsQuery): Promise<GeneralQueryResult>;

  pull(query: GeneralPullQuery): Promise<GeneralPullQueryResult>;

  insertOne(
    command: GeneralSingleInsertCommand
  ): Promise<GeneralSingleInsertCommandResult>;

  insertMulti(
    command: GeneralMultiInsertCommand
  ): Promise<GeneralMultiInsertCommandResult>;

  insertAndGet(
    command: GeneralSingleInsertCommand
  ): Promise<GeneralGetCommandResult>;

  insertAndGetMulti(
    command: GeneralMultiInsertCommand
  ): Promise<GeneralMultiValuesCommandResult>;

  updateById(
    command: GeneralIdUpdateCommand
  ): Promise<GeneralIdUpdateCommandResult>;

  updateMulti(
    command: GeneralMultiUpdateCommand
  ): Promise<MultiUpdateCommandResult>;

  updateAndGet(
    command: GeneralIdUpdateCommand
  ): Promise<GeneralGetCommandResult>;

  updateAndFetch(
    command: GeneralMultiUpdateCommand
  ): Promise<GeneralMultiValuesCommandResult>;

  push(command: GeneralPushCommand): Promise<GeneralPushCommandResult>;

  delete(command: GeneralDeleteCommand): Promise<GeneralDeleteCommandResult>;
}

/**
 * A server-side client to access to entities via DbClient.
 * See `EntityClient` for details.
 * When you need to pass `EntityMap`, use `EntityClient` instead.
 */
export interface GeneralEntityClient extends BaseEntityClient {
  getDbClient(): GeneralDbClient;
  createSessionClient(): GeneralSessionClient;
  createSessionClient<AM extends GeneralAuthCommandMap>(): SessionClient<AM>;
}

/**
 * A server-side client to access to entities via DbClient.
 * It does the following roles.
 *
 * 1. Git-like state management (push/pull, versioning etc...)
 * 2. Transaction management (committing order, lock etc...)
 *
 * `EntityClient` is independent of the type of given `DbClient` (memory, mongo and so on.)
 *
 * When you don't need to pass `M`(`GeneralEntityMap`), use `GeneralEntityClient` instead.
 */
export interface EntityClient<M extends GeneralEntityMap>
  extends GeneralEntityClient {
  getDbClient(): DbClient<M>;

  find<EN extends Key<M>>(query: WhereQuery<EN>): Promise<QueryResult<M[EN]>>;

  findOne<EN extends Key<M>>(
    query: WhereQuery<EN>
  ): Promise<SingleQueryResult<M[EN]>>;

  get<EN extends Key<M>>(query: IdQuery<EN>): Promise<SingleQueryResult<M[EN]>>;

  getByIds<EN extends Key<M>>(query: IdsQuery<EN>): Promise<QueryResult<M[EN]>>;

  pull<EN extends Key<M>>(
    query: PullQuery<EN>
  ): Promise<PullQueryResult<M[EN]>>;

  insertOne<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<M[EN]>>
  ): Promise<SingleInsertCommandResult>;

  insertMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<M[EN]>>
  ): Promise<MultiInsertCommandResult>;

  insertAndGet<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<M[EN]>>
  ): Promise<GetCommandResult<M[EN]>>;

  insertAndGetMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<M[EN]>>
  ): Promise<MultiValuesCommandResult<M[EN]>>;

  updateById<EN extends Key<M>>(
    command: IdUpdateCommand<EN>
  ): Promise<IdUpdateCommandResult>;

  updateMulti<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>
  ): Promise<MultiUpdateCommandResult>;

  updateAndGet<EN extends Key<M>>(
    command: IdUpdateCommand<EN>
  ): Promise<GetCommandResult<M[EN]>>;

  updateAndFetch<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>
  ): Promise<MultiValuesCommandResult<M[EN]>>;

  push<EN extends Key<M>>(
    command: PushCommand<EN>
  ): Promise<PushCommandResult<M[EN]>>;

  delete<EN extends Key<M>>(
    command: DeleteCommand<EN>
  ): Promise<DeleteCommandResult>;
}

/**
 * A server-side client to access to session.
 * When you need to pass `AuthCommandMap`, use `SessionClient` instead.
 */
export type GeneralSessionClient = SessionClient<GeneralAuthCommandMap>;

/**
 * A server-side client to access to session.
 * When you don't need to pass `AM`(`AuthCommandMap`), use `GeneralSessionClient` instead.
 */
export type SessionClient<AM extends GeneralAuthCommandMap> = KvsClient<
  AllSessions<AM>
>;

/**
 * A set of server-side clients.
 *
 * 1. `EntityClient` to access to entities via DbClient.
 * 2. `SessionClient` to access to session.
 *
 * When you need to pass `TypeMap`, use `PhenylClients` instead.
 */
export interface GeneralPhenylClients {
  entityClient: GeneralEntityClient;
  sessionClient: GeneralSessionClient;
}

/**
 * A set of server-side clients.
 * 1. `EntityClient` to access to entities via DbClient.
 * 2. `SessionClient` to access to session.
 *
 * When you don't need to pass `TM`(`GeneralTypeMap`), use `GeneralPhenylClients` instead.
 */
export interface PhenylClients<TM extends GeneralTypeMap>
  extends GeneralPhenylClients {
  entityClient: EntityClient<ResponseEntityMapOf<TM>>;
  sessionClient: SessionClient<AuthCommandMapOf<TM>>;
}
