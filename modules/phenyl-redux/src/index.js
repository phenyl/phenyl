// @flow
import {
  PhenylState,
  PhenylStateFinder,
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
  UpdateAction,
  UpdateCommand,
} from 'phenyl-interfaces'

import {
  assignWithRestoration
} from 'power-assign/jsnext'

/**
 *
 */
export default function phenylReducer(state: ?EntityState, action: PhenylAction): EntityState {
  if (state == null) {
    return new PhenylState()
  }

  switch (action.type) {
    case 'phenyl/$set':
      return action.payload

    case 'phenyl/$register': {
      const { entityName, entities } = action.payload
      const operation = PhenylStateUpdater.$register(state, entityName, ...entities)
      return assignWithRestoration(state, operation)
    }

    case 'phenyl/$update': {
      const operation = PhenylStateUpdater.$update(state, action.payload)
      return assignWithRestoration(state, operation)
    }

    case 'phenyl/$delete': {
      const operation = PhenylStateUpdater.$delete(state, action.payload)
      return assignWithRestoration(state, operation)
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

export function $update(command: UpdateCommand): UpdateAction {
  return {
    type: 'phenyl/$update',
    payload: command
  }
}

export function $delete(command: DeleteCommand): DeleteAction {
  return {
    type: 'phenyl/$delete',
    payload: command
  }
}
