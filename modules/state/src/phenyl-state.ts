import {
  DeleteCommand,
  GeneralReqResEntityMap,
  EntityPool,
  EntityState,
  EntityStateFinder,
  EntityStateUpdater,
  IdQuery,
  IdUpdateCommand,
  IdsQuery,
  MultiUpdateCommand,
  WhereQuery,
  Key
} from "@phenyl/interfaces";
import { GeneralUpdateOperation } from "sp2";
import PhenylStateFinder from "./phenyl-state-finder";
import PhenylStateUpdater from "./phenyl-state-updater";
export type PhenylStateParams<M extends GeneralReqResEntityMap> = {
  pool?: EntityPool<M>;
};

/**
 *
 */

export default class PhenylState<M extends GeneralReqResEntityMap>
  implements EntityState<M>, EntityStateFinder<M>, EntityStateUpdater<M> {
  pool: EntityPool<M>;

  constructor(plain: PhenylStateParams<Partial<M>> = {}) {
    this.pool = plain.pool || {};
  }

  /**
   *
   */
  find(query: WhereQuery<Key<M>>): Array<M[Key<M>]> {
    return PhenylStateFinder.find(this, query);
  }

  /**
   *
   */
  findOne(query: WhereQuery<Key<M>>): M[Key<M>] | undefined | null {
    return PhenylStateFinder.findOne(this, query);
  }

  /**
   *
   */
  get(query: IdQuery<Key<M>>): M[Key<M>] {
    return PhenylStateFinder.get(this, query);
  }

  /**
   *
   */
  getByIds(query: IdsQuery<Key<M>>): Array<M[Key<M>]> {
    return PhenylStateFinder.getByIds(this, query);
  }

  /**
   *
   */
  getAll(entityName: Key<M>): Array<M[Key<M>]> {
    return PhenylStateFinder.getAll(this, entityName);
  }

  /**
   *
   */
  updateById(command: IdUpdateCommand<Key<M>>): GeneralUpdateOperation {
    return PhenylStateUpdater.updateById(this, command);
  }

  /**
   *
   */
  updateMulti(command: MultiUpdateCommand<Key<M>>): GeneralUpdateOperation {
    return PhenylStateUpdater.updateMulti(this, command);
  }

  /**
   *
   */
  register(
    entityName: Key<M>,
    ...pool: Array<M[Key<M>]>
  ): GeneralUpdateOperation {
    return PhenylStateUpdater.register(this, entityName, ...pool);
  }

  /**
   *
   */
  delete(command: DeleteCommand<Key<M>>): GeneralUpdateOperation {
    return PhenylStateUpdater.delete(this, command);
  }

  /**
   *
   */
  has(query: IdQuery<Key<M>>): boolean {
    return PhenylStateFinder.has(this, query);
  }
}
