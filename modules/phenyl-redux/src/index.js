// @flow
import PhenylState from 'phenyl-state/jsnext'
import type {
  DeleteAction,
  DeleteCommand,
  EntityState,
  PhenylAction,
  RegisterAction,
  RestorableEntity,
  SetAction,
  UpdateAction,
  UpdateCommand,
} from 'phenyl-interfaces'

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

    case 'phenyl/$register':
      const { entityName, entities } = action.payload
      return state.$register(entityName, ...entities)

    case 'phenyl/$update':
      return state.$update(action.payload)

    case 'phenyl/$delete':
      return state.$delete(action.payload)
    default:
      return state
  }
}

export function $set(state: EntityState): SetAction {
  return {
    type: 'phenyl/$set',
    payload: state
  }
}

export function $register(entityName: string, ...entities: Array<RestorableEntity>): RegisterAction {
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
