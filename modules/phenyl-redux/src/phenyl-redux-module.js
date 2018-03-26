// @flow
import {
  assign,
} from 'power-assign/jsnext'

import {
  randomStringWithTimeStamp,
} from 'phenyl-utils/jsnext'

import type {
  AssignAction,
  AuthCommandMapOf,
  AuthCommandOf,
  CommitAndPushAction,
  CredentialsOf,
  DeleteAction,
  Entity,
  EntityMapOf,
  EntityNameOf,
  EntityOf,
  FollowAction,
  FollowAllAction,
  Id,
  IdDeleteCommand,
  IdQuery,
  IdUpdateCommand,
  LocalState,
  LoginAction,
  LoginCommand,
  LogoutAction,
  LogoutCommand,
  OptionsOf,
  PhenylAction,
  PullAction,
  PushAndCommitAction,
  ReplaceAction,
  ResetAction,
  SetSessionAction,
  Session,
  TypeMap,
  UnfollowAction,
  UnsetSessionAction,
  UpdateOperation,
  UserEntityNameOf,
} from 'phenyl-interfaces'

export class PhenylReduxModule<TM: TypeMap> {

  static createInitialState(): LocalState<EntityMapOf<TM>> {
    return {
      entities: {},
      network: {
        requests: [],
        isOnline: true,
      },
    }
  }

  /**
   * Reducer.
   */
  static phenylReducer(state: ?LocalState<EntityMapOf<TM>>, action: PhenylAction<EntityMapOf<TM>, AuthCommandMapOf<TM>>): LocalState<EntityMapOf<TM>> {
    if (state == null) {
      return this.createInitialState()
    }

    switch (action.type) {
      case 'phenyl/replace':
        return action.payload

      case 'phenyl/reset':
        return this.createInitialState()

      case 'phenyl/assign':
        return assign(state, ...action.payload)

      default:
        return state
    }
  }

  static replace(state: LocalState<EntityMapOf<TM>>): ReplaceAction<EntityMapOf<TM>> {
    return {
      type: 'phenyl/replace',
      payload: state,
      tag: randomStringWithTimeStamp(),
    }
  }

  static reset(): ResetAction {
    return {
      type: 'phenyl/reset',
      tag: randomStringWithTimeStamp(),
    }
  }

  static assign(ops: Array<UpdateOperation>): AssignAction {
    return {
      type: 'phenyl/assign',
      payload: ops,
      tag: randomStringWithTimeStamp(),
    }
  }

  static setSession(session: Session, user?: ?Entity): SetSessionAction {
    return {
      type: 'phenyl/setSession',
      payload: { session, user },
      tag: randomStringWithTimeStamp(),
    }
  }

  static unsetSession(): UnsetSessionAction {
    return {
      type: 'phenyl/unsetSession',
      tag: randomStringWithTimeStamp(),
    }
  }

  static follow<N: EntityNameOf<TM>>(entityName: N, entity: EntityOf<TM, N>, versionId: Id): FollowAction<N, EntityOf<TM, N>> {
    return {
      type: 'phenyl/follow',
      payload: {
        entityName,
        entity,
        versionId
      },
      tag: randomStringWithTimeStamp(),
    }
  }

  static followAll<N: EntityNameOf<TM>>(entityName: N, entities: Array<EntityOf<TM, N>>, versionsById: { [entityId: Id]: Id }): FollowAllAction<N, EntityOf<TM, N>> {
    return {
      type: 'phenyl/followAll',
      payload: {
        entityName,
        entities,
        versionsById,
      },
      tag: randomStringWithTimeStamp(),
    }
  }

  static unfollow<N: EntityNameOf<TM>>(entityName: N, id: Id): UnfollowAction<N> {
    return {
      type: 'phenyl/unfollow',
      payload: {
        entityName,
        id,
      },
      tag: randomStringWithTimeStamp(),
    }
  }

  static delete<N: EntityNameOf<TM>>(command: IdDeleteCommand<N>): DeleteAction<N> {
    return {
      type: 'phenyl/delete',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  }

  static pushAndCommit<N: EntityNameOf<TM>>(command: IdUpdateCommand<N>): PushAndCommitAction<N> {
    return {
      type: 'phenyl/pushAndCommit',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  }

  static commitAndPush<N: EntityNameOf<TM>>(command: IdUpdateCommand<N>): CommitAndPushAction<N> {
    return {
      type: 'phenyl/commitAndPush',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  }

  static pull<N: EntityNameOf<TM>>(query: IdQuery<N>): PullAction<N> {
    return {
      type: 'phenyl/pull',
      payload: query,
      tag: randomStringWithTimeStamp(),
    }
  }

  static login<N: UserEntityNameOf<TM>, C: CredentialsOf<TM, N>, O: OptionsOf<TM, N>>(command: LoginCommand<N, C, O>): LoginAction<N, AuthCommandOf<TM, N>> {
    return {
      type: 'phenyl/login',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  }

  static logout<N: UserEntityNameOf<TM>>(command: LogoutCommand<N>): LogoutAction<N> {
    return {
      type: 'phenyl/logout',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  }
}

// For backward compatibility
export const actions: Class<PhenylReduxModule<*>> = PhenylReduxModule
export default actions.phenylReducer
