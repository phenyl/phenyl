// @flow

import {
  PhenylStateFinder,
  PhenylStateUpdater,
} from 'phenyl-state/jsnext'
import {
} from 'oad-utils/jsnext'
import {
  createErrorResult,
  randomStringWithTimeStamp,
} from 'phenyl-utils/jsnext'
import { assign } from 'power-assign/jsnext'

import type {
  Entity,
  EntityClientEssence,
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

type MemoryClientParams = {
  entityState?: EntityState,
}

export class PhenylMemoryDbClient implements EntityClientEssence {
  entityState: EntityState

  constructor(params: MemoryClientParams = {}) {
    this.entityState = params.entityState ||  { pool: {} }
  }

  /**
   *
   */
  async find(query: WhereQuery): Promise<Array<Entity>> {
    return PhenylStateFinder.find(this.entityState, query)
  }

  /**
   *
   */
  async findOne(query: WhereQuery): Promise<Entity> {
    const entity = PhenylStateFinder.findOne(this.entityState, query)
    if (entity == null) {
      throw createErrorResult(
        '"PhenylMemoryClient#findOne()" failed. Could not find any entity with the given query',
        'NotFound'
      )
    }
    return entity
  }

  /**
   *
   */
  async get(query: IdQuery): Promise<Entity> {
    try {
      return PhenylStateFinder.get(this.entityState, query)
    }
    catch (e) {
      if (e.constructor.name === 'Error') { // Error from entityState
        throw createErrorResult(
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
  async getByIds(query: IdsQuery): Promise<Array<Entity>> {
    try {
      return PhenylStateFinder.getByIds(this.entityState, query)
    }
    catch (e) {
      if (e.constructor.name === 'Error') { // Error from entityState
        throw createErrorResult(
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
  async insertOne(command: SingleInsertCommand): Promise<number> {
    await this.insertAndGet(command)
    return 1
  }

  /**
   *
   */
  async insertMulti(command: MultiInsertCommand): Promise<number> {
    const entities = await this.insertAndGetMulti(command)
    return entities.length
  }

  /**
   *
   */
  async insertAndGet(command: SingleInsertCommand): Promise<Entity> {
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
  async insertAndGetMulti(command: MultiInsertCommand): Promise<Array<Entity>> {
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
  async updateById(command: IdUpdateCommand): Promise<number> {
    const result = await this.updateAndGet((command: IdUpdateCommand)) // eslint-disable-line no-unused-vars
    return 1
  }

  /**
   *
   */
  async updateMulti(command: MultiUpdateCommand): Promise<number> {
    const entities = await this.updateAndFetch((command: MultiUpdateCommand))
    return entities.length
  }

  /**
   *
   */
  async updateAndGet(command: IdUpdateCommand): Promise<Entity> {
    const { entityName, id } = command
    try {
      const operation = PhenylStateUpdater.updateById(this.entityState, command)
      this.entityState = assign(this.entityState, operation)
      return PhenylStateFinder.get(this.entityState, { entityName, id })
    } catch (error) {
      throw createErrorResult(
        '"PhenylMemoryClient#updateAndGet()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
  }

  /**
   *
   */
  async updateAndFetch(command: MultiUpdateCommand): Promise<Array<Entity>> {
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
  async delete(command: DeleteCommand): Promise<number> {
    const { entityName } = command
    // TODO Performance issue: find() runs twice for just getting N
    const n = command.where ? PhenylStateFinder.find(this.entityState, { where: command.where, entityName }).length : 1
    const operation = PhenylStateUpdater.delete(this.entityState, command)
    this.entityState = assign(this.entityState, operation)
    return n
  }
}
