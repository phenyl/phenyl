import {
  DeleteCommand,
  EntityPool,
  EntityState,
  EntityStateFinder,
  EntityStateUpdater,
  GeneralEntityMap,
  IdQuery,
  IdUpdateCommand,
  IdsQuery,
  Key,
  MultiUpdateCommand,
  WhereQuery
} from "@phenyl/interfaces";

import { GeneralUpdateOperation } from "sp2";
import PhenylStateFinder from "./phenyl-state-finder";
import PhenylStateUpdater from "./phenyl-state-updater";

export type PhenylStateParams<M extends GeneralEntityMap> = {
  pool?: EntityPool<M>;
};

/**
 *
 */

export default class PhenylState<M extends GeneralEntityMap>
  implements EntityState<M>, EntityStateFinder<M>, EntityStateUpdater<M> {
  pool: EntityPool<M>;

  constructor(plain: PhenylStateParams<M> = {}) {
    this.pool = plain.pool || ({} as EntityPool<M>);
  }

  /**
   *
   */
  find<EN extends Key<M>>(query: WhereQuery<EN>): M[EN][] {
    return PhenylStateFinder.find(this, query);
  }

  /**
   *
   */
  findOne<EN extends Key<M>>(query: WhereQuery<EN>): M[EN] | null {
    return PhenylStateFinder.findOne(this, query);
  }

  /**
   *
   */
  get<EN extends Key<M>>(query: IdQuery<EN>): M[EN] {
    return PhenylStateFinder.get(this, query);
  }

  /**
   *
   */
  getByIds<EN extends Key<M>>(query: IdsQuery<EN>): M[EN][] {
    return PhenylStateFinder.getByIds(this, query);
  }

  /**
   *
   */
  getAll<EN extends Key<M>>(entityName: EN): M[EN][] {
    return PhenylStateFinder.getAll(this, entityName);
  }

  /**
   *
   */
  updateById<EN extends Key<M>>(
    command: IdUpdateCommand<EN>
  ): GeneralUpdateOperation {
    return PhenylStateUpdater.updateById(this, command);
  }

  /**
   *
   */
  updateMulti<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>
  ): GeneralUpdateOperation {
    return PhenylStateUpdater.updateMulti(this, command);
  }

  /**
   *
   */
  register<EN extends Key<M>>(
    entityName: EN,
    ...entities: M[EN][]
  ): GeneralUpdateOperation {
    return PhenylStateUpdater.register(this, entityName, ...entities);
  }

  /**
   *
   */
  delete<EN extends Key<M>>(
    command: DeleteCommand<EN>
  ): GeneralUpdateOperation {
    return PhenylStateUpdater.delete(this, command);
  }

  /**
   *
   */
  has<EN extends Key<M>>(query: IdQuery<EN>): boolean {
    return PhenylStateFinder.has(this, query);
  }
}
