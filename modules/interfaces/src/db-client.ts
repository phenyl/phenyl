import {
  DeleteCommand,
  IdUpdateCommand,
  MultiInsertCommand,
  MultiUpdateCommand,
  SingleInsertCommand,
  GeneralSingleInsertCommand,
  GeneralMultiInsertCommand,
  GeneralIdUpdateCommand,
  GeneralMultiUpdateCommand,
  GeneralDeleteCommand
} from "./command";
import { Entity, PreEntity } from "./entity";
import {
  IdQuery,
  IdsQuery,
  WhereQuery,
  GeneralWhereQuery,
  GeneralIdQuery,
  GeneralIdsQuery
} from "./query";

import { GeneralEntityMap } from "./type-map";
import { Key } from "./utils";

export type EntityOf<EM extends GeneralEntityMap, EN extends Key<EM>> = EM[EN];

export type ReplaceOneCommand<EN extends string, E extends Entity> = {
  id: string;
  entityName: EN;
  entity: E;
};

export type GeneralReplaceOneCommand = ReplaceOneCommand<string, Entity>;

export interface GeneralDbClient {
  find(query: GeneralWhereQuery): Promise<Entity[]>;
  findOne(query: GeneralWhereQuery): Promise<Entity>;
  get(query: GeneralIdQuery): Promise<Entity>;
  getByIds(query: GeneralIdsQuery): Promise<Entity[]>;
  insertOne(command: GeneralSingleInsertCommand): Promise<number>;
  insertMulti(command: GeneralMultiInsertCommand): Promise<number>;
  insertAndGet(command: GeneralSingleInsertCommand): Promise<Entity>;
  insertAndGetMulti(command: GeneralMultiInsertCommand): Promise<Entity[]>;
  replaceOne(command: GeneralReplaceOneCommand): Promise<void>;
  updateById(command: GeneralIdUpdateCommand): Promise<void>;
  // TODO #276
  //updateMulti(command: GeneralMultiUpdateCommand): Promise<number>;
  updateAndGet(command: GeneralIdUpdateCommand): Promise<Entity>;
  updateAndFetch(command: GeneralMultiUpdateCommand): Promise<Entity[]>;
  delete(command: GeneralDeleteCommand): Promise<number>;
}

export interface DbClient<M extends GeneralEntityMap> extends GeneralDbClient {
  find<EN extends Key<M>>(
    query: WhereQuery<EN>
  ): Promise<Array<EntityOf<M, EN>>>;

  findOne<EN extends Key<M>>(query: WhereQuery<EN>): Promise<EntityOf<M, EN>>;

  get<EN extends Key<M>>(query: IdQuery<EN>): Promise<EntityOf<M, EN>>;

  getByIds<EN extends Key<M>>(
    query: IdsQuery<EN>
  ): Promise<Array<EntityOf<M, EN>>>;

  insertOne<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<EntityOf<M, EN>>>
  ): Promise<number>;

  insertMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<EntityOf<M, EN>>>
  ): Promise<number>;

  insertAndGet<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<EntityOf<M, EN>>>
  ): Promise<EntityOf<M, EN>>;

  insertAndGetMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<EntityOf<M, EN>>>
  ): Promise<EntityOf<M, EN>[]>;

  replaceOne<EN extends Key<M>>(
    command: ReplaceOneCommand<EN, EntityOf<M, EN>>
  ): Promise<void>;

  updateById<EN extends Key<M>>(command: IdUpdateCommand<EN>): Promise<void>;

  updateAndGet<EN extends Key<M>>(
    command: IdUpdateCommand<EN>
  ): Promise<EntityOf<M, EN>>;

  updateAndFetch<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>
  ): Promise<EntityOf<M, EN>[]>;

  delete<EN extends Key<M>>(command: DeleteCommand<EN>): Promise<number>;
}
