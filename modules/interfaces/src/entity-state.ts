import { DeleteCommand, IdUpdateCommand, MultiUpdateCommand } from "./command";
import { IdQuery, IdsQuery, WhereQuery } from "./query";

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

export interface EntityStateFinder<M extends GeneralEntityMap> {
  find<EN extends Key<M>>(query: WhereQuery<EN>): M[EN][];

  findOne<EN extends Key<M>>(query: WhereQuery<EN>): M[EN] | null;

  get<EN extends Key<M>>(query: IdQuery<EN>): M[EN] | null;

  getByIds<EN extends Key<M>>(query: IdsQuery<EN>): M[EN][];

  has<EN extends Key<M>>(query: IdQuery<EN>): boolean;
}

export interface EntityStateUpdater<M extends GeneralEntityMap> {
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
