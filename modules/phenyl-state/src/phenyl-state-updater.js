// @flow

import {
  retargetToProp,
  mergeOperations,
} from 'power-assign/jsnext'

import type {
  DeleteCommand,
  EntityMap,
  EntityState,
  EntityStateUpdater,
  IdUpdateCommand,
  IdDeleteCommand,
  MultiUpdateCommand,
  MultiDeleteCommand,
  UpdateOperation,
} from 'phenyl-interfaces'

import PhenylStateFinder from './phenyl-state-finder.js'


/**
 *
 */
export default class PhenylStateUpdater<M: EntityMap> implements EntityStateUpdater<M> {

  state: EntityState<M>

  constructor(state: EntityState<M>) {
    this.state = state
  }

  /**
   *
   */
  updateById<N: $Keys<M>>(command: IdUpdateCommand<N>): UpdateOperation {
    return this.constructor.updateById(this.state, command)
  }

  /**
   *
   */
  updateMulti<N: $Keys<M>>(command: MultiUpdateCommand<N>): UpdateOperation {
    return this.constructor.updateMulti(this.state, command)
  }

  /**
   * Register entities.
   * As RestorablePreEntities in InsertCommand does not have "id",
   * PhenylState cannot handle InsertCommand.
   * Instead, it receives in entities created in server.
   */
  register<N: $Keys<M>>(entityName: N, ...entities: Array<$ElementType<M, N>>): UpdateOperation {
    return this.constructor.register(this.state, entityName, ...entities)
  }

  /**
   *
   */
  delete<N: $Keys<M>>(command: DeleteCommand<N>): UpdateOperation {
    return this.constructor.delete(this.state, command)
  }

  /**
   *
   */
  deleteById<N: $Keys<M>>(command: IdDeleteCommand<N>): UpdateOperation {
    return this.constructor.deleteById(this.state, command)
  }

  /**
   *
   */
  deleteByFindOperation<N: $Keys<M>>(command: MultiDeleteCommand<N>): UpdateOperation {
    return this.constructor.deleteByFindOperation(this.state, command)
  }

  /**
   *
   */
  static updateById<N: $Keys<M>>(state: EntityState<M>, command: IdUpdateCommand<N>): UpdateOperation {
    const { id, entityName, operation } = command
    if (!PhenylStateFinder.has(state, { entityName, id })) {
      throw new Error('Could not find any entity to update.')
    }
    const docPath = ['pool', entityName, id].join('.')
    return retargetToProp(docPath, operation)
  }

  /**
   *
   */
  static updateMulti<N: $Keys<M>>(state: EntityState<M>, command: MultiUpdateCommand<N>): UpdateOperation {
    const { where, entityName, operation } = command

    const targetEntities = PhenylStateFinder.find(state, { entityName, where })
    const operationList = targetEntities.map(targetEntity => {
      const docPath = ['pool', entityName, targetEntity.id].join('.')
      return retargetToProp(docPath, operation)
    })
    return mergeOperations(...operationList)
  }

  /**
   * Register entities.
   * As RestorablePreEntities in InsertCommand does not have "id",
   * PhenylState cannot handle InsertCommand.
   * Instead, it receives in entities created in server.
   */
  static register<N: $Keys<M>>(state: EntityState<M>, entityName: string, ...entities: Array<$ElementType<M, N>>): UpdateOperation {
    const operationList = entities.map(entity => {
      const docPath = ['pool', entityName, entity.id].join('.')
      return  { $set: { [docPath]: entity } }
    })
    return mergeOperations(...operationList)
  }

  /**
   *
   */
  static delete<N: $Keys<M>>(state: EntityState<M>, command: DeleteCommand<N>): UpdateOperation {
    if (command.where) {
      return this.deleteByFindOperation(state, command)
    }
    return this.deleteById(state, command)
  }

  /**
   *
   */
  static deleteById<N: $Keys<M>>(state: EntityState<M>, command: IdDeleteCommand<N>): UpdateOperation {
    const { id, entityName } = command
    const docPath = ['pool', entityName, id].join('.')
    return { $unset: {[docPath]: '' } }
  }

  /**
   *
   */
  static deleteByFindOperation<N: $Keys<M>>(state: EntityState<M>, command: MultiDeleteCommand<N>): UpdateOperation {
    const { where, entityName } = command
    const targetEntities = PhenylStateFinder.find(state, { entityName, where })
    const $unset = {}
    targetEntities.forEach(targetEntity => {
      const docPath = ['pool', entityName, targetEntity.id].join('.')
      $unset[docPath] = ''
    })
    return { $unset }
  }
}
