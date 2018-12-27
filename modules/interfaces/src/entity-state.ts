import { DeleteCommand, IdUpdateCommand, MultiUpdateCommand } from "./command";
import { IdQuery, IdsQuery, WhereQuery } from "./query";

import { Entity } from "./entity";
import { GeneralEntityMap } from "./type-map";
import { GeneralUpdateOperation } from "@sp2/format";
import { Key } from "./key";

export type EntityPool<M extends GeneralEntityMap> = {
  [EN in Key<M>]: EntitiesById<M[EN]>
};
export type EntitiesById<T extends Entity> = { [id: string]: T };

export interface EntityState<M extends GeneralEntityMap> {
  pool: EntityPool<M>;
}

export interface EntityStateFinder<M extends GeneralEntityMap> {
  find<EN extends string>(query: WhereQuery<EN>): M[EN][];

  findOne<EN extends string>(query: WhereQuery<EN>): M[EN] | null;

  get<EN extends string>(query: IdQuery<EN>): M[EN];

  getByIds<EN extends string>(query: IdsQuery<EN>): M[EN][];

  has<EN extends string>(query: IdQuery<EN>): boolean;
}

export interface EntityStateUpdater<M extends GeneralEntityMap> {
  register<N extends string>(
    entityName: N,
    ...entities: Array<M[N]>
  ): GeneralUpdateOperation;

  updateById<N extends string>(
    command: IdUpdateCommand<N>
  ): GeneralUpdateOperation;

  updateMulti<N extends string>(
    command: MultiUpdateCommand<N>
  ): GeneralUpdateOperation;

  delete<N extends string>(command: DeleteCommand<N>): GeneralUpdateOperation;
}
