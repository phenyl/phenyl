// @flow
import {
  PhenylStateFinder,
  PhenylStateUpdater,
} from 'phenyl-state/jsnext'
import {
} from 'oad-utils/jsnext'
import {
  PhenylResponseError,
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
  InsertCommand,
  SingleInsertCommand,
  MultiInsertCommand,
  UpdateCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  WhereQuery,
} from 'phenyl-interfaces'

type MemoryClientParams = {
  entityState?: EntityState,
}

export default class PhenylMemoryClientEssence implements EntityClientEssence {
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
      throw new PhenylResponseError(
        '"PhenylMemoryClient#findOne()" failed. Could not find any entity with the given query.',
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
        throw new PhenylResponseError(
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
        throw new PhenylResponseError(
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
  async insert(command: InsertCommand): Promise<number> {
    if (command.values) {
      const entities = await this.insertAndGetMulti(command)
      return entities.length
    }
    await this.insertAndGet(command)
    return 1
  }

  /**
   *
   */
  async insertAndGet(command: SingleInsertCommand): Promise<Entity> {
    const { entityName, value } = command
    const newValue = value.id
      ? value
      : assign(value, { id: randomStringWithTimeStamp() })
    const operation = PhenylStateUpdater.$register(this.entityState, entityName, newValue)
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
      const operation = PhenylStateUpdater.$register(this.entityState, entityName, newValue)
      this.entityState = assign(this.entityState, operation)
    }
    return newValues
  }

  /**
   *
   */
  async update(command: UpdateCommand): Promise<number> {
    if (command.id != null) {
      // $FlowIssue(this-is-IdUpdateCommand)
      const result = await this.updateAndGet((command: IdUpdateCommand)) // eslint-disable-line no-unused-vars
      return 1
    }
    // $FlowIssue(this-is-MultiUpdateCommand)
    const entities = await this.updateAndFetch((command: MultiUpdateCommand))
    return entities.length
  }

  /**
   *
   */
  async updateAndGet(command: IdUpdateCommand): Promise<Entity> {
    const { entityName, id } = command
    const operation = PhenylStateUpdater.$update(this.entityState, command)
    this.entityState = assign(this.entityState, operation)
    return PhenylStateFinder.get(this.entityState, { entityName, id })
  }

  /**
   *
   */
  async updateAndFetch(command: MultiUpdateCommand): Promise<Array<Entity>> {
    const { entityName, where } = command
    // TODO Performance issue: find() runs twice for just getting N
    const values = PhenylStateFinder.find(this.entityState, { entityName, where })
    const ids = values.map(value => value.id)
    const operation = PhenylStateUpdater.$update(this.entityState, command)
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
    const operation = PhenylStateUpdater.$delete(this.entityState, command)
    this.entityState = assign(this.entityState, operation)
    return n
  }
}
