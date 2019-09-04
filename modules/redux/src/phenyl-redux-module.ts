import { update, GeneralUpdateOperation } from "sp2";
import { randomStringWithTimeStamp } from "@phenyl/utils";
import {
  AssignAction,
  CommitAction,
  RePushAction,
  PushAction,
  PushActionPayload,
  CommitAndPushAction,
  DeleteAction,
  Entity,
  FollowAction,
  FollowAllAction,
  IdDeleteCommand,
  IdQuery,
  IdUpdateCommand,
  LocalState,
  LoginAction,
  LoginCommand,
  LogoutAction,
  LogoutCommand,
  GeneralAction,
  PullAction,
  PushAndCommitAction,
  ResolveErrorAction,
  ReplaceAction,
  ResetAction,
  SetSessionAction,
  OnlineAction,
  OfflineAction,
  Session,
  UnfollowAction,
  UnsetSessionAction,
  UseEntitiesAction,
  GeneralEntityRestInfoMap,
  GeneralAuthCommandMap,
  GeneralTypeMap,
  EntityRestInfoMapOf,
  Key,
  LocalEntityState
} from "@phenyl/interfaces";

type Id = string;

export class PhenylReduxModule {
  static createInitialState<
    RM extends GeneralEntityRestInfoMap,
    AM extends GeneralAuthCommandMap
  >(): LocalState<RM, AM> {
    return {
      entities: {} as LocalEntityState<RM>,
      unreachedCommits: [],
      network: {
        requests: [],
        isOnline: true
      }
    };
  }

  /**
   * Reducer.
   */
  static phenylReducer<
    RM extends GeneralEntityRestInfoMap,
    AM extends GeneralAuthCommandMap
  >(
    state: LocalState<RM, AM> | undefined | null,
    action: GeneralAction
  ): LocalState<RM, AM> {
    if (state == null) {
      return this.createInitialState();
    }

    switch (action.type) {
      case "phenyl/replace":
        return {
          ...state,
          ...action.payload
        };

      case "phenyl/reset":
        return this.createInitialState();

      case "phenyl/assign":
        return update(state, ...action.payload) as LocalState<RM, AM>;

      default:
        return state;
    }
  }

  static replace<
    RM extends GeneralEntityRestInfoMap,
    AM extends GeneralAuthCommandMap
  >(state: LocalState<RM, AM>): ReplaceAction<LocalState<RM, AM>> {
    return {
      type: "phenyl/replace",
      payload: state,
      tag: randomStringWithTimeStamp()
    };
  }

  static useEntities<RM extends GeneralEntityRestInfoMap, EN extends Key<RM>>(
    entityNames: EN[]
  ): UseEntitiesAction<EN> {
    return {
      type: "phenyl/useEntities",
      payload: entityNames,
      tag: randomStringWithTimeStamp()
    };
  }

  static reset(): ResetAction {
    return {
      type: "phenyl/reset",
      tag: randomStringWithTimeStamp()
    };
  }

  static assign(ops: GeneralUpdateOperation[]): AssignAction {
    return {
      type: "phenyl/assign",
      payload: ops,
      tag: randomStringWithTimeStamp()
    };
  }

  static setSession<EN extends string, E extends Entity>(
    session: Session<EN>,
    user?: E
  ): SetSessionAction<EN, E> {
    return {
      type: "phenyl/setSession",
      payload: {
        session,
        user
      },
      tag: randomStringWithTimeStamp()
    };
  }

  static unsetSession(): UnsetSessionAction {
    return {
      type: "phenyl/unsetSession",
      tag: randomStringWithTimeStamp()
    };
  }

  static follow<M extends GeneralEntityRestInfoMap, EN extends Key<M>>(
    entityName: EN,
    entity: Entity,
    versionId: Id
  ): FollowAction<EN, Entity> {
    return {
      type: "phenyl/follow",
      payload: {
        entityName,
        entity,
        versionId
      },
      tag: randomStringWithTimeStamp()
    };
  }

  static followAll<M extends GeneralEntityRestInfoMap, EN extends Key<M>>(
    entityName: EN,
    entities: Entity[],
    versionsById: {
      [entityId: string]: string;
    }
  ): FollowAllAction<EN, Entity> {
    return {
      type: "phenyl/followAll",
      payload: {
        entityName,
        entities,
        versionsById
      },
      tag: randomStringWithTimeStamp()
    };
  }

  static unfollow<M extends GeneralEntityRestInfoMap, EN extends Key<M>>(
    entityName: EN,
    id: string
  ): UnfollowAction<EN> {
    return {
      type: "phenyl/unfollow",
      payload: {
        entityName,
        id
      },
      tag: randomStringWithTimeStamp()
    };
  }

  static delete<
    TM extends GeneralTypeMap,
    EN extends Key<EntityRestInfoMapOf<TM>>
  >(command: IdDeleteCommand<EN>): DeleteAction<EN> {
    return {
      type: "phenyl/delete",
      payload: command,
      tag: randomStringWithTimeStamp()
    };
  }

  static pushAndCommit<M extends GeneralEntityRestInfoMap, EN extends Key<M>>(
    command: IdUpdateCommand<EN>
  ): PushAndCommitAction<EN> {
    return {
      type: "phenyl/pushAndCommit",
      payload: command,
      tag: randomStringWithTimeStamp()
    };
  }

  static commit<M extends GeneralEntityRestInfoMap, EN extends Key<M>>(
    command: IdUpdateCommand<EN>
  ): CommitAction<EN> {
    return {
      type: "phenyl/commit",
      payload: command,
      tag: randomStringWithTimeStamp()
    };
  }

  static push<M extends GeneralEntityRestInfoMap, EN extends Key<M>>(
    payload: PushActionPayload<EN>
  ): PushAction<EN> {
    return {
      type: "phenyl/push",
      payload: { until: -1, ...payload },
      tag: randomStringWithTimeStamp()
    };
  }

  static repush(): RePushAction {
    return {
      type: "phenyl/repush",
      tag: randomStringWithTimeStamp()
    };
  }

  static commitAndPush<M extends GeneralEntityRestInfoMap, EN extends Key<M>>(
    command: IdUpdateCommand<EN>
  ): CommitAndPushAction<EN> {
    return {
      type: "phenyl/commitAndPush",
      payload: command,
      tag: randomStringWithTimeStamp()
    };
  }

  static pull<M extends GeneralEntityRestInfoMap, EN extends Key<M>>(
    query: IdQuery<EN>
  ): PullAction<EN> {
    return {
      type: "phenyl/pull",
      payload: query,
      tag: randomStringWithTimeStamp()
    };
  }

  static login<
    TM extends GeneralTypeMap,
    EN extends Key<EntityRestInfoMapOf<TM>>,
    C extends Object
  >(command: LoginCommand<EN, C>): LoginAction<EN, C> {
    return {
      type: "phenyl/login",
      payload: command,
      tag: randomStringWithTimeStamp()
    };
  }

  static logout<RM extends GeneralEntityRestInfoMap, EN extends Key<RM>>(
    command: LogoutCommand<EN>
  ): LogoutAction<EN> {
    return {
      type: "phenyl/logout",
      payload: command,
      tag: randomStringWithTimeStamp()
    };
  }

  static online(): OnlineAction {
    return {
      type: "phenyl/online"
    };
  }

  static offline(): OfflineAction {
    return {
      type: "phenyl/offline"
    };
  }

  static resolveError(): ResolveErrorAction {
    return {
      type: "phenyl/resolveError"
    };
  }
}
// For backward compatibility
export const actions = PhenylReduxModule;

export default actions.phenylReducer.bind(actions);
