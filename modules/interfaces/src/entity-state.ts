import { DeleteCommand, IdUpdateCommand, MultiUpdateCommand } from "./command";
import { GeneralReqResEntityMap, ResponseEntity } from "./type-map";
import { IdQuery, IdsQuery, WhereQuery } from "./query";

import { Entity } from "./entity";
import { GeneralUpdateOperation } from "sp2";
import { Key } from "./utils";

export type EntityPool<M extends GeneralReqResEntityMap> = {
  [EN in Key<M>]: EntitiesById<ResponseEntity<M, EN>>
};
export type EntitiesById<T extends Entity> = { [id: string]: T };

export interface EntityState<M extends GeneralReqResEntityMap> {
  pool: EntityPool<M>;
}

export interface EntityStateFinder<M extends GeneralReqResEntityMap> {
  find<EN extends Key<M>>(query: WhereQuery<EN>): ResponseEntity<M, EN>[];

  findOne<EN extends Key<M>>(
    query: WhereQuery<EN>
  ): ResponseEntity<M, EN> | null;

  get<EN extends Key<M>>(query: IdQuery<EN>): ResponseEntity<M, EN> | null;

  getByIds<EN extends Key<M>>(query: IdsQuery<EN>): ResponseEntity<M, EN>[];

  has<EN extends Key<M>>(query: IdQuery<EN>): boolean;
}

export interface EntityStateUpdater<M extends GeneralReqResEntityMap> {
  register<EN extends Key<M>>(
    entityName: EN,
    ...entities: ResponseEntity<M, EN>[]
  ): GeneralUpdateOperation;

  updateById<EN extends Key<M>>(
    command: IdUpdateCommand<EN>
  ): GeneralUpdateOperation;

  updateMulti<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>
  ): GeneralUpdateOperation;

  delete<EN extends Key<M>>(command: DeleteCommand<EN>): GeneralUpdateOperation;
}
