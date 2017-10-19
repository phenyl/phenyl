// @flow

import {
  retargetToProp,
  mergeOperators,
} from 'power-assign/jsnext'

import type {
  DeleteCommand,
  EntityState,
  EntityStateUpdater,
  IdUpdateCommand,
  IdDeleteCommand,
  MultiUpdateCommand,
  MultiDeleteCommand,
  Entity,
  UpdateCommand,
  UpdateOperation,
} from 'phenyl-interfaces'

import PhenylStateFinder from './phenyl-state-finder.js'


/**
 *
 */
export default class PhenylStateUpdater implements EntityStateUpdater {

  state: EntityState

  constructor(state: EntityState) {
    this.state = state
  }

  /**
   *
   */
  $update(command: UpdateCommand): UpdateOperation {
    return this.constructor.$update(this.state, command)
  }

  /**
   *
   */
  $updateById(command: IdUpdateCommand): UpdateOperation {
    return this.constructor.$updateById(this.state, command)
  }

  /**
   *
   */
  $updateByWhereCondition(command: MultiUpdateCommand): UpdateOperation {
    return this.constructor.$updateByWhereCondition(this.state, command)
  }

  /**
   * Register entities.
   * As RestorablePreEntities in InsertCommand does not have "id",
   * PhenylState cannot handle InsertCommand.
   * Instead, it receives in entities created in server.
   */
  $register(entityName: string, ...entities: Array<Entity>): UpdateOperation {
    return this.constructor.$register(this.state, entityName, ...entities)
  }

  /**
   *
   */
  $delete(command: DeleteCommand): UpdateOperation {
    return this.constructor.$delete(this.state, command)
  }

  /**
   *
   */
  $deleteById(command: IdDeleteCommand): UpdateOperation {
    return this.constructor.$deleteById(this.state, command)
  }

  /**
   *
   */
  $deleteByWhereConditions(command: MultiDeleteCommand): UpdateOperation {
    return this.constructor.$deleteByWhereConditions(this.state, command)
  }

  /**
   *
   */
  static $update(state: EntityState, command: UpdateCommand): UpdateOperation {
    if (command.where) {
      return this.$updateByWhereCondition(state, command)
    }
    return this.$updateById(state, command)
  }

  /**
   *
   */
  static $updateById(state: EntityState, command: IdUpdateCommand): UpdateOperation {
    const { id, entityName, operators } = command
    const docPath = ['pool', entityName, id].join('.')
    return retargetToProp(docPath, operators)
  }

  /**
   *
   */
  static $updateByWhereCondition(state: EntityState, command: MultiUpdateCommand): UpdateOperation {
    const { where, entityName, operators } = command
    const targetEntities = PhenylStateFinder.find(state, { entityName, where })
    const operatorsList = targetEntities.map(targetEntity => {
      const docPath = ['pool', entityName, targetEntity.id].join('.')
      return retargetToProp(docPath, operators)
    })
    return mergeOperators(...operatorsList)
  }

  /**
   * Register entities.
   * As RestorablePreEntities in InsertCommand does not have "id",
   * PhenylState cannot handle InsertCommand.
   * Instead, it receives in entities created in server.
   */
  static $register(state: EntityState, entityName: string, ...entities: Array<Entity>): UpdateOperation {
    const operatorsList = entities.map(entity => {
      const docPath = ['pool', entityName, entity.id].join('.')
      return  { $set: { [docPath]: entity } }
    })
    return mergeOperators(...operatorsList)
  }

  /**
   *
   */
  static $delete(state: EntityState, command: DeleteCommand): UpdateOperation {
    if (command.where) {
      return this.$deleteByWhereConditions(state, command)
    }
    return this.$deleteById(state, command)
  }

  /**
   *
   */
  static $deleteById(state: EntityState, command: IdDeleteCommand): UpdateOperation {
    const { id, entityName } = command
    const docPath = ['pool', entityName, id].join('.')
    return { $unset: {[docPath]: '' } }
  }

  /**
   *
   */
  static $deleteByWhereConditions(state: EntityState, command: MultiDeleteCommand): UpdateOperation {
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
