import { sortByNotation } from "oad-utils";
import { filter } from "power-filter";
import {
  GeneralReqResEntityMap,
  EntityState,
  EntityStateFinder,
  IdQuery,
  IdsQuery,
  WhereQuery,
  Key
} from "@phenyl/interfaces";

/**
 *
 */

export default class PhenylStateFinder<M extends GeneralReqResEntityMap>
  implements EntityStateFinder<M> {
  state: EntityState<M>;

  constructor(state: EntityState<M>) {
    this.state = state;
  }
  /**
   *
   */

  find(query: WhereQuery<Key<M>>): Array<M[Key<M>]> {
    return PhenylStateFinder.find(this.state, query);
  }
  /**
   *
   */

  findOne(query: WhereQuery<Key<M>>): M[Key<M>] | undefined | null {
    return PhenylStateFinder.findOne(this.state, query);
  }
  /**
   *
   */

  get(query: IdQuery<Key<M>>): M[Key<M>] {
    return PhenylStateFinder.get(this.state, query);
  }
  /**
   *
   */

  getByIds(query: IdsQuery<Key<M>>): Array<M[Key<M>]> {
    return PhenylStateFinder.getByIds(this.state, query);
  }
  /**
   *
   */

  getAll(entityName: Key<M>): Array<M[Key<M>]> {
    return PhenylStateFinder.getAll(this.state, entityName);
  }
  /**
   *
   */

  has(query: IdQuery<Key<M>>): boolean {
    return PhenylStateFinder.has(this.state, query);
  }
  /**
   *
   */

  static getAll<M extends GeneralReqResEntityMap>(
    state: EntityState<M>,
    entityName: Key<M>
  ): Array<M[Key<M>]> {
    const pool = state.pool[entityName];

    if (pool == null) {
      throw new Error(`entityName: "${entityName}" is not found.`);
    }

    return Object.keys(pool).map(key => pool[key]);
  }
  /**
   *
   */

  static find<M extends GeneralReqResEntityMap>(
    state: EntityState<M>,
    query: WhereQuery<Key<M>>
  ): Array<M[Key<M>]> {
    const { entityName, where, sort, skip, limit } = query;
    let filtered = filter(this.getAll(state, entityName), where);

    if (sort != null) {
      filtered = sortByNotation(filtered, sort);
    }

    const skipVal = skip || 0;
    const limitVal = limit != null ? limit + skipVal : filtered.length;
    return filtered.slice(skipVal, limitVal);
  }
  /**
   *
   */

  static findOne<M extends GeneralReqResEntityMap>(
    state: EntityState<M>,
    query: WhereQuery<Key<M>>
  ): M[Key<M>] | undefined | null {
    return this.find(state, query)[0];
  }
  /**
   *
   */

  static get<M extends GeneralReqResEntityMap>(
    state: EntityState<M>,
    query: IdQuery<Key<M>>
  ): M[Key<M>] {
    const entitiesById = state.pool[query.entityName];
    if (entitiesById == null) throw new Error("NoEntityRegistered");
    const entity = entitiesById[query.id];
    if (entity == null) throw new Error("NoId");
    return entity;
  }
  /**
   *
   */

  static getByIds<M extends GeneralReqResEntityMap>(
    state: EntityState<M>,
    query: IdsQuery<Key<M>>
  ): Array<M[Key<M>]> {
    const { ids, entityName } = query; // TODO: handle error

    return ids.map(id =>
      this.get(state, {
        entityName,
        id
      })
    );
  }
  /**
   *
   */

  static has<M extends GeneralReqResEntityMap>(
    state: EntityState<M>,
    query: IdQuery<Key<M>>
  ): boolean {
    try {
      PhenylStateFinder.get(state, query);
    } catch (error) {
      return false;
    }

    return true;
  }
}
