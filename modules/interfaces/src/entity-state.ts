import {
  DeleteCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  GeneralIdUpdateCommand,
  GeneralMultiUpdateCommand,
  GeneralDeleteCommand
} from "./command";
import {
  IdQuery,
  IdsQuery,
  WhereQuery,
  GeneralWhereQuery,
  GeneralIdQuery,
  GeneralIdsQuery
} from "./query";

import { Entity } from "./entity";
import { GeneralEntityMap } from "./type-map";
import { GeneralUpdateOperation } from "sp2";
import { Key } from "./utils";

export type EntityPool<M extends GeneralEntityMap> = {
  [EN in Key<M>]: EntitiesById<M[EN]>
};
export type EntitiesById<T extends Entity> = { [id: string]: T };

export interface EntityState<M extends GeneralEntityMap> {
  pool: EntityPool<M>;
}

export interface GeneralEntityStateFinder {
  find(query: GeneralWhereQuery): Entity[];

  findOne(query: GeneralWhereQuery): Entity | null;

  get(query: GeneralIdQuery): Entity | null;

  getByIds(query: GeneralIdsQuery): Entity[];

  has(query: GeneralIdQuery): boolean;
}

export interface EntityStateFinder<M extends GeneralEntityMap>
  extends GeneralEntityStateFinder {
  find<EN extends Key<M>>(query: WhereQuery<EN>): M[EN][];

  findOne<EN extends Key<M>>(query: WhereQuery<EN>): M[EN] | null;

  get<EN extends Key<M>>(query: IdQuery<EN>): M[EN] | null;

  getByIds<EN extends Key<M>>(query: IdsQuery<EN>): M[EN][];

  has<EN extends Key<M>>(query: IdQuery<EN>): boolean;
}

export interface GeneralEntityStateUpdater {
  register(entityName: string, ...entities: Entity[]): GeneralUpdateOperation;

  updateById(command: GeneralIdUpdateCommand): GeneralUpdateOperation;

  updateMulti(command: GeneralMultiUpdateCommand): GeneralUpdateOperation;

  delete(command: GeneralDeleteCommand): GeneralUpdateOperation;
}

export interface EntityStateUpdater<M extends GeneralEntityMap>
  extends GeneralEntityStateUpdater {
  register<EN extends Key<M>>(
    entityName: EN,
    ...entities: M[EN][]
  ): GeneralUpdateOperation;

  updateById<EN extends Key<M>>(
    command: IdUpdateCommand<EN>
  ): GeneralUpdateOperation;

  updateMulti<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>
  ): GeneralUpdateOperation;

  delete<EN extends Key<M>>(command: DeleteCommand<EN>): GeneralUpdateOperation;
}
