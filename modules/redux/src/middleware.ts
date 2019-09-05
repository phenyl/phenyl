import { Middleware, Dispatch, AnyAction } from "redux";
import { LocalStateUpdater } from "./local-state-updater";
import { LocalStateFinder } from "./local-state-finder";
import {
  CommitAction,
  RePushAction,
  PatchAction,
  GeneralAction,
  ResolveErrorAction,
  RestApiClient,
  GeneralTypeMap,
  UnfollowAction,
  UserEntityNameOf,
  ActionWithTypeMap,
  EntityNameOf,
  DeleteActionOf,
  LoginActionOf,
  LogoutActionOf,
  PushAndCommitActionOf,
  SetSessionActionOf,
  LocalStateOf,
  UseEntitiesActionOf,
  CommitAndPushActionOf,
  PushActionOf,
  FollowActionOf,
  FollowAllActionOf,
  PullActionOf
} from "@phenyl/interfaces";
import { GeneralUpdateOperation } from "sp2";
import { ActionCreator } from "./action-creator";

type Next = Dispatch<AnyAction>;

export type MiddlewareOptions<TM extends GeneralTypeMap> = {
  client: RestApiClient<TM>;
  storeKey?: string;
};

export function createMiddleware<TM extends GeneralTypeMap>(
  options: MiddlewareOptions<TM>
): Middleware {
  const storeKey = options.storeKey || "phenyl";
  return (store: any) => (next: Dispatch<AnyAction>) => {
    const client = options.client;

    const getState = () => store.getState()[storeKey];

    const handler: MiddlewareHandler<TM> = new MiddlewareHandler(
      getState,
      client,
      next
    );
    return <EN extends EntityNameOf<TM>, UN extends UserEntityNameOf<TM>>(
      action: ActionWithTypeMap<TM, EN, UN>
    ): Promise<AnyAction> | AnyAction => {
      switch (action.type) {
        case "phenyl/useEntities":
          return handler.useEntities(action);

        case "phenyl/commitAndPush":
          return handler.commitAndPush(action);

        case "phenyl/commit":
          return handler.commit(action);

        case "phenyl/push":
          return handler.push(action);

        case "phenyl/repush":
          return handler.repush(action);

        case "phenyl/delete":
          return handler.delete(action);

        case "phenyl/follow":
          return handler.follow(action);

        case "phenyl/followAll":
          return handler.followAll(action);

        case "phenyl/login":
          return handler.login(action);

        case "phenyl/logout":
          return handler.logout(action);

        case "phenyl/patch":
          return handler.patch(action);

        case "phenyl/pull":
          return handler.pull(action);

        case "phenyl/pushAndCommit":
          return handler.pushAndCommit(action);

        case "phenyl/resolveError":
          return handler.resolveError(action);

        case "phenyl/setSession":
          return handler.setSession(action);

        case "phenyl/unfollow":
          return handler.unfollow(action);

        case "phenyl/unsetSession":
          return handler.unsetSession();

        case "phenyl/online":
          return handler.online();

        case "phenyl/offline":
          return handler.offline();

        default:
          return next(action);
      }
    };
  };
}

/**
 *
 */
export class MiddlewareHandler<TM extends GeneralTypeMap> {
  static LocalStateUpdater = LocalStateUpdater;
  getState: () => LocalStateOf<TM>;
  client: RestApiClient<TM>;
  next: Next;
  actions: ActionCreator<TM>;

  constructor(
    getState: () => LocalStateOf<TM>,
    client: RestApiClient<TM>,
    next: Next
  ) {
    this.getState = getState;
    this.client = client;
    this.next = next;
    this.actions = new ActionCreator<TM>();
  }

  /**
   *
   */
  get state(): LocalStateOf<TM> {
    return this.getState();
  }

  /**
   * Invoke reducer 1: Assign operation(s) to state.
   */
  async assignToState(...ops: GeneralUpdateOperation[]) {
    return this.next(this.actions.assign(ops));
  }

  /**
   * Invoke reducer 2: Reset state.
   */
  async resetState() {
    return this.next(this.actions.reset());
  }

  /**
   *
   */
  get sessionId(): string | undefined | null {
    const { session } = this.state;
    return session ? session.id : null;
  }

  /**
   * Initialize entity fields with an empty map object if not exists.
   */
  async useEntities(action: UseEntitiesActionOf<TM>) {
    const entityNames = action.payload;
    const ops = entityNames
      .filter(
        entityName => !LocalStateFinder.hasEntityField(this.state, entityName)
      )
      .map(entityName => LocalStateUpdater.initialize(this.state, entityName));
    return this.assignToState(...ops);
  }

  /**
   * Commit to LocalState and then Push to the CentralState.
   * If failed, the commit is still applied.
   * In such cases, pull the entity first.
   * Only when Authorization Error occurred, it will be rollbacked.
   */
  async commitAndPush<EN extends EntityNameOf<TM>>(
    action: CommitAndPushActionOf<TM, EN>
  ) {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;
    const { id, entityName } = action.payload;

    this.assignToState(
      LocalStateUpdater.commit(this.state, action.payload),
      LocalStateUpdater.networkRequest(this.state, action.tag)
    );
    const { versionId, commits } = LocalStateFinder.getEntityInfo(this.state, {
      entityName,
      id
    });
    const pushCommand = {
      id,
      operations: commits,
      entityName,
      versionId
    };
    const ops = [];

    try {
      const result = await this.client.push(pushCommand, this.sessionId);

      if (result.hasEntity) {
        ops.push(
          LocalStateUpdater.follow(
            this.state,
            entityName,
            result.entity,
            result.versionId
          )
        );
      } else {
        ops.push(
          LocalStateUpdater.synchronize(
            this.state,
            {
              entityName,
              id,
              operations: result.operations,
              versionId: result.versionId
            },
            commits
          )
        );
      }
    } catch (e) {
      ops.push(LocalStateUpdater.error(e, action.tag));

      switch (e.type) {
        case "NetworkFailed": {
          ops.push(
            LocalStateUpdater.addUnreachedCommits(this.state, {
              id,
              entityName,
              commitCount: commits.length
            })
          );
          ops.push(LocalStateUpdater.offline());
          break;
        }

        default: {
          break;
        }
      }
    } finally {
      ops.push(LocalStateUpdater.removeNetworkRequest(this.state, action.tag));
    }

    return this.assignToState(...ops);
  }

  /**
   * Commit to LocalState.
   */
  async commit<EN extends EntityNameOf<TM>>(action: CommitAction<EN>) {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;
    return this.assignToState(
      LocalStateUpdater.commit(this.state, action.payload)
    );
  }

  /**
   * Push to the CentralState.
   * If failed, the commit is still applied.
   * In such cases, pull the entity first.
   * Only when Authorization Error occurred, it will be rollbacked.
   */
  async push<EN extends EntityNameOf<TM>>(action: PushActionOf<TM, EN>) {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;
    const { id, entityName, until } = action.payload;
    const { versionId, commits } = LocalStateFinder.getEntityInfo(this.state, {
      entityName,
      id
    });
    const commitsToPush = until >= 0 ? commits.slice(0, until) : commits;

    if (commitsToPush.length === 0) {
      return this.next(action);
    }

    this.assignToState(
      LocalStateUpdater.networkRequest(this.state, action.tag)
    );
    const pushCommand = {
      id,
      operations: commitsToPush,
      entityName,
      versionId
    };
    const ops = [];

    try {
      const result = await this.client.push(pushCommand, this.sessionId);

      if (result.hasEntity) {
        ops.push(
          LocalStateUpdater.follow(
            this.state,
            entityName,
            result.entity,
            result.versionId
          )
        );
      } else {
        ops.push(
          LocalStateUpdater.synchronize(
            this.state,
            {
              entityName,
              id,
              operations: result.operations,
              versionId: result.versionId
            },
            commits
          )
        );
      }
    } catch (e) {
      ops.push(LocalStateUpdater.error(e, action.tag));

      switch (e.type) {
        case "NetworkFailed": {
          ops.push(
            LocalStateUpdater.addUnreachedCommits(this.state, {
              id,
              entityName,
              commitCount: commitsToPush.length
            })
          );
          ops.push(LocalStateUpdater.offline());
          break;
        }

        default: {
          break;
        }
      }
    } finally {
      ops.push(LocalStateUpdater.removeNetworkRequest(this.state, action.tag));
    }

    return this.assignToState(...ops);
  }

  /**
   * Push unreached commits to the CentralState.
   * If failed, the commit is still applied.
   * Only when Authorization Error occurred, it will be rollbacked.
   */
  async repush(action: RePushAction) {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;

    for (let unreachedCommit of this.state.unreachedCommits) {
      const ops = [];
      const { entityName, id, commitCount } = unreachedCommit;
      const { versionId, commits } = LocalStateFinder.getEntityInfo(
        this.state,
        {
          entityName,
          id
        }
      );
      const operations = commits.slice(0, commitCount);
      this.assignToState(
        LocalStateUpdater.networkRequest(this.state, action.tag)
      );

      const pushCommand = {
        id,
        operations,
        entityName,
        versionId
      };

      try {
        const result = await this.client.push(pushCommand, this.sessionId);
        ops.push(
          LocalStateUpdater.removeUnreachedCommits(this.state, unreachedCommit)
        );

        if (result.hasEntity) {
          ops.push(
            LocalStateUpdater.follow(
              this.state,
              entityName,
              result.entity,
              result.versionId
            )
          );
        } else {
          ops.push(
            LocalStateUpdater.synchronize(
              this.state,
              {
                entityName,
                id,
                operations: result.operations,
                versionId: result.versionId
              },
              operations
            )
          );
        }
      } catch (e) {
        ops.push(LocalStateUpdater.error(e, action.tag));
      } finally {
        ops.push(
          LocalStateUpdater.removeNetworkRequest(this.state, action.tag)
        );
        await this.assignToState(...ops);
      }
    }

    return this.assignToState();
  }

  /**
   * Delete the entity in the CentralState, then unfollow the entity in LocalState.
   */
  async delete<EN extends EntityNameOf<TM>>(action: DeleteActionOf<TM, EN>) {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;
    const { entityName, id } = action.payload;
    this.assignToState(
      LocalStateUpdater.networkRequest(this.state, action.tag)
    );
    const ops = [];

    try {
      await this.client.delete(action.payload);
      ops.push(LocalStateUpdater.unfollow(this.state, entityName, id));
    } catch (e) {
      ops.push(LocalStateUpdater.error(e, action.tag));
    } finally {
      ops.push(LocalStateUpdater.removeNetworkRequest(this.state, action.tag));
    }

    return this.assignToState(...ops);
  }

  /**
   * Register the given entity.
   */
  async follow<EN extends EntityNameOf<TM>>(action: FollowActionOf<TM, EN>) {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;
    const { entityName, entity, versionId } = action.payload;
    return this.assignToState(
      LocalStateUpdater.follow(this.state, entityName, entity, versionId)
    );
  }

  /**
   * Register all the given entities.
   */
  async followAll<EN extends EntityNameOf<TM>>(
    action: FollowAllActionOf<TM, EN>
  ): Promise<GeneralAction> {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;
    const { entityName, entities, versionsById } = action.payload;
    return this.assignToState(
      LocalStateUpdater.followAll(
        this.state,
        entityName,
        entities,
        versionsById
      )
    );
  }

  /**
   * Login with credentials, then register the user.
   */
  async login<UN extends UserEntityNameOf<TM>>(action: LoginActionOf<TM, UN>) {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;
    const command = action.payload;
    await this.assignToState(
      LocalStateUpdater.networkRequest(this.state, action.tag)
    );
    let ops = [];

    try {
      const result = await this.client.login(command, this.sessionId);
      ops.push(
        LocalStateUpdater.setSession(
          this.state,
          result.session,
          result.user,
          result.versionId
        )
      );
    } catch (e) {
      ops.push(LocalStateUpdater.error(e, action.tag));
    } finally {
      ops.push(LocalStateUpdater.removeNetworkRequest(this.state, action.tag));
    }

    return this.assignToState(...ops);
  }

  /**
   * Remove the session in CentralState and reset the LocalState.
   */
  async logout<UN extends UserEntityNameOf<TM>>(
    action: LogoutActionOf<TM, UN>
  ) {
    const command = action.payload;
    await this.client.logout(command, this.sessionId);
    return this.resetState();
  }

  /**
   * Apply the VersionDiff.
   */
  async patch(action: PatchAction) {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;
    const versionDiff = action.payload;
    return this.assignToState(LocalStateUpdater.patch(this.state, versionDiff));
  }

  /**
   * Push to the CentralState, then commit to LocalState.
   * If push failed, the commit is not applied.
   */
  async pushAndCommit<EN extends EntityNameOf<TM>>(
    action: PushAndCommitActionOf<TM, EN>
  ) {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;
    await this.assignToState(
      LocalStateUpdater.networkRequest(this.state, action.tag)
    );
    LocalStateUpdater.commit(this.state, action.payload);

    const { operation, id, entityName } = action.payload;
    const { versionId, commits } = LocalStateFinder.getEntityInfo(this.state, {
      entityName,
      id
    });
    const operations = commits.slice();
    operations.push(operation);
    const pushCommand = {
      id,
      operations,
      entityName,
      versionId
    };
    const ops = [];

    try {
      const result = await this.client.push(pushCommand, this.sessionId);

      if (result.hasEntity) {
        ops.push(
          LocalStateUpdater.follow(
            this.state,
            entityName,
            result.entity,
            result.versionId
          )
        );
      } else {
        ops.push(
          LocalStateUpdater.synchronize(
            this.state,
            {
              entityName,
              id,
              operations: result.operations,
              versionId: result.versionId
            },
            operations
          )
        );
      }
    } catch (e) {
      ops.push(LocalStateUpdater.error(e, action.tag));
    } finally {
      ops.push(LocalStateUpdater.removeNetworkRequest(this.state, action.tag));
    }

    return this.assignToState(...ops);
  }

  /**
   * Unset error.
   */
  async resolveError(action: ResolveErrorAction) {
    return this.assignToState(LocalStateUpdater.resolveError());
  }

  /**
   * Pull the differences from CentralState, then rebase the diffs.
   */
  async pull<EN extends EntityNameOf<TM>>(action: PullActionOf<TM, EN>) {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;
    const { id, entityName } = action.payload;
    const { versionId } = LocalStateFinder.getEntityInfo(
      this.state,
      action.payload
    );
    const pullQuery = {
      id,
      entityName,
      versionId
    };
    const result = await this.client.pull(pullQuery, this.sessionId);
    const ops = [];

    if (result.pulled) {
      ops.push(
        LocalStateUpdater.rebase(this.state, {
          entityName,
          id,
          operations: result.operations,
          versionId: result.versionId
        })
      );
    } else {
      ops.push(
        LocalStateUpdater.follow(
          this.state,
          entityName,
          result.entity,
          result.versionId
        )
      );
    }

    return this.assignToState(...ops);
  }

  /**
   * Set session info. Register user if exists.
   */
  async setSession<UN extends UserEntityNameOf<TM>>(
    action: SetSessionActionOf<TM, UN>
  ) {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;
    const { user, versionId, session } = action.payload;
    return this.assignToState(
      LocalStateUpdater.setSession(this.state, session, user, versionId)
    );
  }

  /**
   * Unregister the entity.
   */
  async unfollow<EN extends EntityNameOf<TM>>(action: UnfollowAction<EN>) {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;
    const { entityName, id } = action.payload;
    return this.assignToState(
      LocalStateUpdater.unfollow(this.state, entityName, id)
    );
  }

  /**
   * Unset session info. It doesn't remove the user info.
   */
  async unsetSession() {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;
    return this.assignToState(LocalStateUpdater.unsetSession());
  }

  /**
   * Mark as online.
   */
  async online() {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;
    return this.assignToState(LocalStateUpdater.online());
  }

  /**
   * Mark as offline.
   */
  async offline() {
    const LocalStateUpdater = MiddlewareHandler.LocalStateUpdater;
    return this.assignToState(LocalStateUpdater.offline());
  }
}
