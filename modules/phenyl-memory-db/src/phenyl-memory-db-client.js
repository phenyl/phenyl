// @flow

import {
  PhenylStateFinder,
  PhenylStateUpdater,
} from 'phenyl-state/jsnext'
import {
} from 'oad-utils/jsnext'
import {
  createServerError,
  randomStringWithTimeStamp,
} from 'phenyl-utils/jsnext'
import { assign } from 'power-assign/jsnext'

import type {
  PreEntity,
  EntityMap,
  DbClient,
  EntityState,
  DeleteCommand,
  IdQuery,
  IdsQuery,
  SingleInsertCommand,
  MultiInsertCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  WhereQuery,
} from 'phenyl-interfaces'

type MemoryClientParams<M: EntityMap> = {
  entityState?: EntityState<M>,
}

export class PhenylMemoryDbClient<M: EntityMap> implements DbClient<M> {
  entityState: EntityState<M>

  constructor(params: MemoryClientParams<M> = {}) {
    this.entityState = params.entityState ||  { pool: {} }
  }

  /**
   *
   */
  async find<N: $Keys<M>>(query: WhereQuery<N>): Promise<Array<$ElementType<M, N>>> {
    return PhenylStateFinder.find(this.entityState, query)
  }

  /**
   *
   */
  async findOne<N: $Keys<M>>(query: WhereQuery<N>): Promise<$ElementType<M, N>> {
    const entity = PhenylStateFinder.findOne(this.entityState, query)
    if (entity == null) {
      throw createServerError(
        '"PhenylMemoryClient#findOne()" failed. Could not find any entity with the given query',
        'NotFound'
      )
    }
    return entity
  }

  /**
   *
   */
  async get<N: $Keys<M>>(query: IdQuery<N>): Promise<$ElementType<M, N>> {
    try {
      return PhenylStateFinder.get(this.entityState, query)
    }
    catch (e) {
      if (e.constructor.name === 'Error') { // Error from entityState
        throw createServerError(
          `"PhenylMemoryClient#get()" failed. Could not find any entity with the given id: "${query.id}"`,
          'NotFound'
        )
      }
      throw e
    }
  }

  /**
   *
   */
  async getByIds<N: $Keys<M>>(query: IdsQuery<N>): Promise<Array<$ElementType<M, N>>> {
    try {
      return PhenylStateFinder.getByIds(this.entityState, query)
    }
    catch (e) {
      if (e.constructor.name === 'Error') { // Error from entityState
        throw createServerError(
          `"PhenylMemoryClient#getByIds()" failed. Some ids are not found. ids: "${query.ids.join(', ')}"`, // TODO: prevent from showing existing ids
          'NotFound',
        )
      }
      throw e
    }
  }

  /**
   *
   */
  async insertOne<N: $Keys<M>>(command: SingleInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<number> {
    await this.insertAndGet(command)
    return 1
  }

  /**
   *
   */
  async insertMulti<N: $Keys<M>>(command: MultiInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<number> {
    const entities = await this.insertAndGetMulti(command)
    return entities.length
  }

  /**
   *
   */
  async insertAndGet<N: $Keys<M>>(command: SingleInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<$ElementType<M, N>> {
    const { entityName, value } = command
    const newValue = value.id
      ? value
      : assign(value, { id: randomStringWithTimeStamp() })
    const operation = PhenylStateUpdater.register(this.entityState, entityName, newValue)
    this.entityState = assign(this.entityState, operation)
    return newValue
  }

  /**
   *
   */
  async insertAndGetMulti<N: $Keys<M>>(command: MultiInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<Array<$ElementType<M, N>>> {
    const { entityName, values } = command
    const newValues = values.map(value => value.id ? value : assign(value, { id: randomStringWithTimeStamp() }))

    for (const newValue of newValues) {
      const operation = PhenylStateUpdater.register(this.entityState, entityName, newValue)
      this.entityState = assign(this.entityState, operation)
    }
    return newValues
  }

  /**
   *
   */
  async updateById<N: $Keys<M>>(command: IdUpdateCommand<N>): Promise<number> {
    const result = await this.updateAndGet((command: IdUpdateCommand<N>)) // eslint-disable-line no-unused-vars
    return 1
  }

  /**
   *
   */
  async updateMulti<N: $Keys<M>>(command: MultiUpdateCommand<N>): Promise<number> {
    const entities = await this.updateAndFetch((command: MultiUpdateCommand<N>))
    return entities.length
  }

  /**
   *
   */
  async updateAndGet<N: $Keys<M>>(command: IdUpdateCommand<N>): Promise<$ElementType<M, N>> {
    const { entityName, id } = command
    try {
      const operation = PhenylStateUpdater.updateById(this.entityState, command)
      this.entityState = assign(this.entityState, operation)
      return PhenylStateFinder.get(this.entityState, { entityName, id })
    } catch (error) {
      throw createServerError(
        '"PhenylMemoryClient#updateAndGet()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
  }

  /**
   *
   */
  async updateAndFetch<N: $Keys<M>>(command: MultiUpdateCommand<N>): Promise<Array<$ElementType<M, N>>> {
    const { entityName, where } = command
    // TODO Performance issue: find() runs twice for just getting N
    const values = PhenylStateFinder.find(this.entityState, { entityName, where })
    const ids = values.map(value => value.id)
    const operation = PhenylStateUpdater.updateMulti(this.entityState, command)
    this.entityState = assign(this.entityState, operation)
    const updatedValues = PhenylStateFinder.getByIds(this.entityState, { ids, entityName })
    return updatedValues
  }

  /**
   *
   */
  async delete<N: $Keys<M>>(command: DeleteCommand<N>): Promise<number> {
    const { entityName } = command
    // TODO Performance issue: find() runs twice for just getting N
    const n = command.where ? PhenylStateFinder.find(this.entityState, { where: command.where, entityName }).length : 1
    const operation = PhenylStateUpdater.delete(this.entityState, command)
    this.entityState = assign(this.entityState, operation)
    return n
  }
}
