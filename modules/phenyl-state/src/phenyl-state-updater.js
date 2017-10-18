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
  UpdateOperators,
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
  $update(command: UpdateCommand): UpdateOperators {
    return this.constructor.$update(this.state, command)
  }

  /**
   *
   */
  $updateById(command: IdUpdateCommand): UpdateOperators {
    return this.constructor.$updateById(this.state, command)
  }

  /**
   *
   */
  $updateByWhereCondition(command: MultiUpdateCommand): UpdateOperators {
    return this.constructor.$updateByWhereCondition(this.state, command)
  }

  /**
   * Register entities.
   * As RestorablePreEntities in InsertCommand does not have "id",
   * PhenylState cannot handle InsertCommand.
   * Instead, it receives in entities created in server.
   */
  $register(entityName: string, ...entities: Array<Entity>): UpdateOperators {
    return this.constructor.$register(this.state, entityName, ...entities)
  }

  /**
   *
   */
  $delete(command: DeleteCommand): UpdateOperators {
    return this.constructor.$delete(this.state, command)
  }

  /**
   *
   */
  $deleteById(command: IdDeleteCommand): UpdateOperators {
    return this.constructor.$deleteById(this.state, command)
  }

  /**
   *
   */
  $deleteByWhereConditions(command: MultiDeleteCommand): UpdateOperators {
    return this.constructor.$deleteByWhereConditions(this.state, command)
  }

  /**
   *
   */
  static $update(state: EntityState, command: UpdateCommand): UpdateOperators {
    if (command.where) {
      return this.$updateByWhereCondition(state, command)
    }
    return this.$updateById(state, command)
  }

  /**
   *
   */
  static $updateById(state: EntityState, command: IdUpdateCommand): UpdateOperators {
    const { id, entityName, operators } = command
    const docPath = ['pool', entityName, id].join('.')
    return retargetToProp(docPath, operators)
  }

  /**
   *
   */
  static $updateByWhereCondition(state: EntityState, command: MultiUpdateCommand): UpdateOperators {
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
  static $register(state: EntityState, entityName: string, ...entities: Array<Entity>): UpdateOperators {
    const operatorsList = entities.map(entity => {
      const docPath = ['pool', entityName, entity.id].join('.')
      return  { $set: { [docPath]: entity } }
    })
    return mergeOperators(...operatorsList)
  }

  /**
   *
   */
  static $delete(state: EntityState, command: DeleteCommand): UpdateOperators {
    if (command.where) {
      return this.$deleteByWhereConditions(state, command)
    }
    return this.$deleteById(state, command)
  }

  /**
   *
   */
  static $deleteById(state: EntityState, command: IdDeleteCommand): UpdateOperators {
    const { id, entityName } = command
    const docPath = ['pool', entityName, id].join('.')
    return { $unset: {[docPath]: '' } }
  }

  /**
   *
   */
  static $deleteByWhereConditions(state: EntityState, command: MultiDeleteCommand): UpdateOperators {
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
