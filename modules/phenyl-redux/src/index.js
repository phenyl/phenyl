// @flow
import {
  PhenylStateUpdater,
} from 'phenyl-state/jsnext'
import type {
  DeleteAction,
  DeleteCommand,
  EntityState,
  PhenylAction,
  RegisterAction,
  Entity,
  SetAction,
} from 'phenyl-interfaces'

import {
  assign
} from 'power-assign/jsnext'

/**
 *
 */
export default function phenylReducer(state: ?EntityState, action: PhenylAction): EntityState {
  if (state == null) {
    return { pool: {} }
  }

  switch (action.type) {
    case 'phenyl/$set':
      return action.payload

    case 'phenyl/$register': {
      const { entityName, entities } = action.payload
      const operation = PhenylStateUpdater.$register(state, entityName, ...entities)
      return assign(state, operation)
    }

    case 'phenyl/$delete': {
      const operation = PhenylStateUpdater.$delete(state, action.payload)
      return assign(state, operation)
    }
    default: {
      return state
    }
  }
}

export function $set(state: EntityState): SetAction {
  return {
    type: 'phenyl/$set',
    payload: state
  }
}

export function $register(entityName: string, ...entities: Array<Entity>): RegisterAction {
  return {
    type: 'phenyl/$register',
    payload: {
      entityName,
      entities
    }
  }
}

export function $delete(command: DeleteCommand): DeleteAction {
  return {
    type: 'phenyl/$delete',
    payload: command
  }
}
