// @flow
import PhenylState from 'phenyl-state/jsnext'
import { createErrorResult } from 'phenyl-utils/jsnext'
import type { PhenylStateParams } from 'phenyl-state/jsnext'

import type {
  EntityClient,
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
  phenylState?: PhenylStateParams,
}

// TODO: implement cooler one externally
function generateRandomStr(): string {
  return 'p' + Math.random().toString().split('.')[1] + 't' + new Date().getTime().toString()
}

export default class PhenylMemoryClient implements EntityClient {
  phenylState: PhenylState

  constructor(params: MemoryClientParams = {}) {
    this.phenylState = new PhenylState(params.phenylState || {})
  }

  /**
   *
   */
  async find(query: WhereQuery): Promise<QueryResultOrError> {
    try {
      const entities = this.phenylState.find(query)
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
      const entity = this.phenylState.findOne(query)
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
      const entity = this.phenylState.get(query)
      return {
        ok: 1,
        value: entity
      }
    }
    catch (e) {
      if (e.constructor.name === 'Error') { // Error from PhenylState
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
      const entities = this.phenylState.getByIds(query)
      return {
        ok: 1,
        values: entities
      }
    }
    catch (e) {
      if (e.constructor.name === 'Error') { // Error from PhenylState
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
    const newValue = Object.assign({}, value, { id: generateRandomStr() })
    this.phenylState = this.phenylState.$register(entityName, newValue)
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
      const newValue = Object.assign({}, value, { id: generateRandomStr() })
      this.phenylState = this.phenylState.$register(entityName, newValue)
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
      this.phenylState = this.phenylState.$update(command)
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
      this.phenylState = this.phenylState.$update(command)
      return { ok: 1, n: 1, value: this.phenylState.get({ entityName, id }) }
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
      const values = this.phenylState.find({ entityName, where })
      const ids = values.map(value => value.id)
      this.phenylState = this.phenylState.$update(command)
      return { ok: 1, n: values.length, values: this.phenylState.getByIds({ ids, entityName }) }
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
      const n = command.where ? this.phenylState.find({ where: command.where, entityName }).length : 1
      this.phenylState = this.phenylState.$delete(command)
      return { ok: 1, n }
    }
    catch (e) {
      return createErrorResult(e)
    }
  }
}
