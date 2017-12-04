// @flow
import { assign } from 'power-assign/jsnext'

import { randomStringWithTimeStamp } from 'phenyl-utils/jsnext'

import type {
  AssignAction,
  CommitAndPushAction,
  DeleteAction,
  Entity,
  FollowAction,
  FollowAllAction,
  Id,
  IdDeleteCommand,
  IdUpdateCommand,
  LocalState,
  LoginAction,
  LoginCommand,
  LogoutAction,
  LogoutCommand,
  PhenylAction,
  PullAction,
  PullQuery,
  PushAndCommitAction,
  ReplaceAction,
  ResetAction,
  SetSessionAction,
  Session,
  UnfollowAction,
  UnsetSessionAction,
  UpdateOperation,
} from 'phenyl-interfaces'

export const createInitialState = () => ({
  entities: {},
  network: {
    requests: [],
    isOnline: true,
  },
})

/**
 * Reducer.
 */
export default function phenylReducer(
  state: ?LocalState,
  action: PhenylAction
): LocalState {
  if (state == null) {
    return createInitialState()
  }

  switch (action.type) {
    case 'phenyl/replace':
      return action.payload

    case 'phenyl/reset':
      return createInitialState()

    case 'phenyl/assign':
      return assign(state, ...action.payload)

    default:
      return state
  }
}

/**
 * Action Creators.
 */
export const actions = {
  replace(state: LocalState): ReplaceAction {
    return {
      type: 'phenyl/replace',
      payload: state,
      tag: randomStringWithTimeStamp(),
    }
  },

  reset(): ResetAction {
    return {
      type: 'phenyl/reset',
      tag: randomStringWithTimeStamp(),
    }
  },

  assign(ops: Array<UpdateOperation>): AssignAction {
    return {
      type: 'phenyl/assign',
      payload: ops,
      tag: randomStringWithTimeStamp(),
    }
  },

  setSession(session: Session, user?: ?Entity): SetSessionAction {
    return {
      type: 'phenyl/setSession',
      payload: { session, user },
      tag: randomStringWithTimeStamp(),
    }
  },

  unsetSession(): UnsetSessionAction {
    return {
      type: 'phenyl/unsetSession',
      tag: randomStringWithTimeStamp(),
    }
  },

  follow(entityName: string, entity: Entity, versionId: Id): FollowAction {
    return {
      type: 'phenyl/follow',
      payload: {
        entityName,
        entity,
        versionId,
      },
      tag: randomStringWithTimeStamp(),
    }
  },

  followAll(
    entityName: string,
    entities: Array<Entity>,
    versionsById: { [entityId: Id]: Id }
  ): FollowAllAction {
    return {
      type: 'phenyl/followAll',
      payload: {
        entityName,
        entities,
        versionsById,
      },
      tag: randomStringWithTimeStamp(),
    }
  },

  unfollow(entityName: string, id: Id): UnfollowAction {
    return {
      type: 'phenyl/unfollow',
      payload: {
        entityName,
        id,
      },
      tag: randomStringWithTimeStamp(),
    }
  },

  delete(command: IdDeleteCommand): DeleteAction {
    return {
      type: 'phenyl/delete',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  },

  pushAndCommit(command: IdUpdateCommand): PushAndCommitAction {
    return {
      type: 'phenyl/pushAndCommit',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  },

  commitAndPush(command: IdUpdateCommand): CommitAndPushAction {
    return {
      type: 'phenyl/commitAndPush',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  },

  pull(query: PullQuery): PullAction {
    return {
      type: 'phenyl/pull',
      payload: query,
      tag: randomStringWithTimeStamp(),
    }
  },

  login(command: LoginCommand): LoginAction {
    return {
      type: 'phenyl/login',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  },

  logout(command: LogoutCommand): LogoutAction {
    return {
      type: 'phenyl/logout',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  },
}
