// @flow
import {
  PhenylStateFinder,
  PhenylStateUpdater,
} from 'phenyl-state/jsnext'
import { createErrorResult } from 'phenyl-utils/jsnext'
import { assign } from 'power-assign/jsnext'
import randomString from './random-string.js'

import type {
  EntityClient,
  EntityState,
  CommandResultOrError,
  DeleteCommand,
  MultiValuesCommandResultOrError,
  GetCommandResultOrError,
  Id,
  IdQuery,
  IdsQuery,
  InsertCommand,
  SingleInsertCommand,
  MultiInsertCommand,
  RequestData,
  ResponseData,
  QueryResultOrError,
  QueryStringParams,
  SingleQueryResultOrError,
  UpdateCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  WhereQuery,
} from 'phenyl-interfaces'

type MemoryClientParams = {
  entityState?: EntityState,
}

export default class PhenylMemoryClient implements EntityClient {
  entityState: EntityState

  constructor(params: MemoryClientParams = {}) {
    this.entityState = params.entityState ||  { pool: {} }
  }

  /**
   *
   */
  async find(query: WhereQuery): Promise<QueryResultOrError> {
    try {
      const entities = PhenylStateFinder.find(this.entityState, query)
      return {
        ok: 1,
        values: entities
      }
    }
    catch (e) {
      return createErrorResult(e)
    }
  }

  /**
   *
   */
  async findOne(query: WhereQuery): Promise<SingleQueryResultOrError> {
    try {
      const entity = PhenylStateFinder.findOne(this.entityState, query)
      if (entity == null) {
        return {
          ok: 0,
          type: 'NotFound',
          message: '"PhenylMemoryClient#findOne()" failed. Could not find any entity with the given query.',
        }
      }
      return {
        ok: 1,
        value: entity
      }
    }
    catch (e) {
      return createErrorResult(e)
    }
  }

  /**
   *
   */
  async get(query: IdQuery): Promise<SingleQueryResultOrError> {
    try {
      const entity = PhenylStateFinder.get(this.entityState, query)
      return {
        ok: 1,
        value: entity
      }
    }
    catch (e) {
      if (e.constructor.name === 'Error') { // Error from entityState
        return {
          ok: 0,
          type: 'NotFound',
          message: `"PhenylMemoryClient#get()" failed. Could not find any entity with the given id: "${query.id}"`,
        }
      }
      return createErrorResult(e)
    }
  }

  /**
   *
   */
  async getByIds(query: IdsQuery): Promise<QueryResultOrError> {
    try {
      const entities = PhenylStateFinder.getByIds(this.entityState, query)
      return {
        ok: 1,
        values: entities
      }
    }
    catch (e) {
      if (e.constructor.name === 'Error') { // Error from entityState
        return {
          ok: 0,
          type: 'NotFound',
          message: `"PhenylMemoryClient#getByIds()" failed. Some ids are not found. ids: "${query.ids.join(', ')}"`, // TODO: prevent from showing existing ids
        }
      }
      return createErrorResult(e)
    }
  }

  /**
   *
   */
  async insert(command: InsertCommand): Promise<CommandResultOrError> {
    if (command.values) {
      const result = await this.insertAndGetMulti(command)
      return result.ok
        ? { ok: 1, n: result.n }
        : result
    }
    const result = await this.insertAndGet(command)
    return result.ok
      ? { ok: 1, n: 1 }
      : result
  }

  /**
   *
   */
  async insertAndGet(command: SingleInsertCommand): Promise<GetCommandResultOrError> {
    const { entityName, value } = command
    const newValue = value.id
      ? value
      : assign(value, { id: randomString() })
    const operators = PhenylStateUpdater.$register(this.entityState, entityName, newValue)
    this.entityState = assign(this.entityState, operators)
    return {
      ok: 1,
      n: 1,
      value: newValue,
    }
  }

  /**
   *
   */
  async insertAndGetMulti(command: MultiInsertCommand): Promise<MultiValuesCommandResultOrError> {
    const { entityName, values} = command
    const newValues = []
    for (const value of values) {
      const newValue = value.id
        ? value
        : assign(value, { id: randomString() })
      const operators = PhenylStateUpdater.$register(this.entityState, entityName, newValue)
      this.entityState = assign(this.entityState, operators)
      newValues.push(newValue)
    }
    return {
      ok: 1,
      n: newValues.length,
      values: newValues,
    }
  }

  /**
   *
   */
  async update(command: UpdateCommand): Promise<CommandResultOrError> {
    try {
      const operators = PhenylStateUpdater.$update(this.entityState, command)
      this.entityState = assign(this.entityState, operators)
      return { ok: 1, n: 1 }
    }
    catch (e) {
      return createErrorResult(e)
    }
  }

  /**
   *
   */
  async updateAndGet(command: IdUpdateCommand): Promise<GetCommandResultOrError> {
    const { entityName, id } = command
    try {
      const operators = PhenylStateUpdater.$update(this.entityState, command)
      this.entityState = assign(this.entityState, operators)
      return { ok: 1, n: 1, value: PhenylStateFinder.get(this.entityState, { entityName, id }) }
    }
    catch (e) {
      return createErrorResult(e)
    }
  }

  /**
   *
   */
  async updateAndFetch(command: MultiUpdateCommand): Promise<MultiValuesCommandResultOrError> {
    const { entityName, where } = command
    try {
      // TODO Performance issue: find() runs twice for just getting N
      const values = PhenylStateFinder.find(this.entityState, { entityName, where })
      const ids = values.map(value => value.id)
      const operators = PhenylStateUpdater.$update(this.entityState, command)
      this.entityState = assign(this.entityState, operators)
      return { ok: 1, n: values.length, values: PhenylStateFinder.getByIds(this.entityState, { ids, entityName }) }
    }
    catch (e) {
      return createErrorResult(e)
    }
  }

  /**
   *
   */
  async delete(command: DeleteCommand): Promise<CommandResultOrError> {
    const { entityName } = command
    try {
      // TODO Performance issue: find() runs twice for just getting N
      const n = command.where ? PhenylStateFinder.find(this.entityState, { where: command.where, entityName }).length : 1
      const operators = PhenylStateUpdater.$delete(this.entityState, command)
      this.entityState = assign(this.entityState, operators)
      return { ok: 1, n }
    }
    catch (e) {
      return createErrorResult(e)
    }
  }
}
