import {
  EntityState,
  EntityStateFinder,
  GeneralEntityMap,
  IdQuery,
  IdsQuery,
  Key,
  WhereQuery
} from "@phenyl/interfaces";
import { retrieve, sortByNotation } from "sp2";

/**
 *
 */

export default class PhenylStateFinder<M extends GeneralEntityMap>
  implements EntityStateFinder<M> {
  state: EntityState<M>;

  constructor(state: EntityState<M>) {
    this.state = state;
  }
  /**
   *
   */
  find<EN extends Key<M>>(query: WhereQuery<EN>): M[EN][] {
    return PhenylStateFinder.find(this.state, query);
  }
  /**
   *
   */

  findOne<EN extends Key<M>>(query: WhereQuery<EN>): M[EN] | null {
    return PhenylStateFinder.findOne(this.state, query);
  }
  /**
   *
   */

  get<EN extends Key<M>>(query: IdQuery<EN>): M[EN] {
    return PhenylStateFinder.get(this.state, query);
  }
  /**
   *
   */

  getByIds<EN extends Key<M>>(query: IdsQuery<EN>): M[EN][] {
    return PhenylStateFinder.getByIds(this.state, query);
  }
  /**
   *
   */

  getAll<EN extends Key<M>>(entityName: EN): M[EN][] {
    return PhenylStateFinder.getAll(this.state, entityName);
  }
  /**
   *
   */

  has<EN extends Key<M>>(query: IdQuery<EN>): boolean {
    return PhenylStateFinder.has(this.state, query);
  }
  /**
   *
   */

  static getAll<M extends GeneralEntityMap, EN extends Key<M>>(
    state: EntityState<M>,
    entityName: EN
  ): M[EN][] {
    const pool = state.pool[entityName];

    if (pool == null) {
      throw new Error(`entityName: "${entityName}" is not found.`);
    }

    return Object.keys(pool).map(key => pool[key]);
  }
  /**
   *
   */

  static find<M extends GeneralEntityMap, EN extends Key<M>>(
    state: EntityState<M>,
    query: WhereQuery<EN>
  ): M[EN][] {
    const { entityName, where, sort, skip, limit } = query;
    let filtered = retrieve(this.getAll(state, entityName), where);

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

  static findOne<M extends GeneralEntityMap, EN extends Key<M>>(
    state: EntityState<M>,
    query: WhereQuery<EN>
  ): M[EN] | null {
    return this.find(state, query)[0];
  }
  /**
   *
   */

  static get<M extends GeneralEntityMap, EN extends Key<M>>(
    state: EntityState<M>,
    query: IdQuery<EN>
  ): M[EN] {
    const entitiesById = state.pool[query.entityName];
    if (entitiesById == null) throw new Error("NoEntityRegistered");
    const entity = entitiesById[query.id];
    if (entity == null) throw new Error("NoId");
    return entity;
  }

  /**
   *
   */
  static getByIds<M extends GeneralEntityMap, EN extends Key<M>>(
    state: EntityState<M>,
    query: IdsQuery<EN>
  ): M[EN][] {
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

  static has<M extends GeneralEntityMap, EN extends Key<M>>(
    state: EntityState<M>,
    query: IdQuery<EN>
  ): boolean {
    try {
      PhenylStateFinder.get(state, query);
    } catch (error) {
      return false;
    }

    return true;
  }
}
