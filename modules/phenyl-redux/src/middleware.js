// @flow

import { PhenylReduxModule } from './phenyl-redux-module.js'

import { LocalStateUpdater } from './local-state-updater.js'
import { LocalStateFinder } from './local-state-finder.js'

import type {
  AuthCommandMapOf,
  AuthCommandOf,
  CommitAndPushAction,
  DeleteAction,
  EntityMapOf,
  EntityNameOf,
  EntityOf,
  FollowAction,
  FollowAllAction,
  Id,
  LocalState,
  LoginAction,
  LogoutAction,
  PatchAction,
  PhenylAction,
  PushAndCommitAction,
  PushCommand,
  PullAction,
  RestApiClient,
  SetSessionAction,
  TypeMap,
  UnfollowAction,
  UpdateOperation,
  UserEntityNameOf,
} from 'phenyl-interfaces'

type Store = any

type PhenylActionOf<TM: TypeMap> = PhenylAction<EntityMapOf<TM>, AuthCommandMapOf<TM>>
type LocalStateOf<TM: TypeMap> = LocalState<EntityMapOf<TM>>

type Options<TM: TypeMap> = {
  client: RestApiClient<TM>,
  storeKey?: string;
}

type Next<TM: TypeMap> = (action: PhenylActionOf<TM>) => LocalStateOf<TM>

export class MiddlewareCreator<TM: TypeMap> {
  /**
   *
   */
  static create = (options: Options<TM>) => (store: Store) => (next: Next<TM>) => {
    const storeKey = options.storeKey || 'phenyl'
    const client = options.client
    const handler: MiddlewareHandler<TM> = new MiddlewareHandler(store, storeKey, client, next)

    return (action: PhenylActionOf<TM>) => {
      switch (action.type) {
        case 'phenyl/commitAndPush':
          return handler.commitAndPush(action)
        case 'phenyl/delete':
          return handler.delete(action)
        case 'phenyl/follow':
          return handler.follow(action)
        case 'phenyl/followAll':
          return handler.followAll(action)
        case 'phenyl/login':
          return handler.login(action)
        case 'phenyl/logout':
          return handler.logout(action)
        case 'phenyl/patch':
          return handler.patch(action)
        case 'phenyl/pull':
          return handler.pull(action)
        case 'phenyl/pushAndCommit':
          return handler.pushAndCommit(action)
        case 'phenyl/setSession':
          return handler.setSession(action)
        case 'phenyl/unfollow':
          return handler.unfollow(action)
        case 'phenyl/unsetSession':
          return handler.unsetSession()
        default:
          return next(action)
      }
    }
  }
}

/**
 *
 */
export class MiddlewareHandler<TM: TypeMap> {
  static LocalStateUpdater: Class<LocalStateUpdater<TM>> = LocalStateUpdater
  static PhenylReduxModule: Class<PhenylReduxModule<TM>> = PhenylReduxModule
  store: Store
  storeKey: string
  client: RestApiClient<TM>
  next: Next<TM>

  constructor(store: Store, storeKey: string, client: RestApiClient<TM>, next: Next<TM>) {
    this.store = store
    this.storeKey = storeKey
    this.client = client
    this.next = next
  }

  /**
   *
   */
  get state(): LocalStateOf<TM> {
    return this.store.getState()[this.storeKey]
  }

  /**
   * Invoke reducer 1: Assign operation(s) to state.
   */
  assignToState(...ops: Array<UpdateOperation>): LocalStateOf<TM> {
    const { PhenylReduxModule } = this.constructor
    return this.next(PhenylReduxModule.assign(ops))
  }

  /**
   * Invoke reducer 2: Reset state.
   */
  resetState(): LocalStateOf<TM> {
    const { PhenylReduxModule } = this.constructor
    return this.next(PhenylReduxModule.reset())
  }

  /**
   *
   */
  get sessionId(): ?Id {
    const { session } = this.state
    return session ? session.id : null
  }

  /**
   * Commit to LocalState and then Push to the CentralState.
   * If failed, the commit is still applied.
   * In such cases, pull the entity first.
   * Only when Authorization Error occurred, it will be rollbacked.
   */
  async commitAndPush<N: EntityNameOf<TM>>(action: CommitAndPushAction<N>) {
    const { LocalStateUpdater } = this.constructor
    const { id, entityName } = action.payload

    this.assignToState(
      LocalStateUpdater.commit(this.state, action.payload),
      LocalStateUpdater.networkRequest(this.state, action.tag)
    )

    const { versionId, commits } = LocalStateFinder.getEntityInfo(this.state, { entityName, id })
    const pushCommand: PushCommand<N> = { id, operations: commits, entityName, versionId }

    const ops = []
    try {
      const result = await this.client.push(pushCommand, this.sessionId)
      if (result.hasEntity) {
        ops.push(LocalStateUpdater.follow(this.state, entityName, result.entity, result.versionId))
      }
      else {
        ops.push(
          LocalStateUpdater.synchronize(this.state, { entityName, id, operations: result.operations, versionId: result.versionId }, commits),
        )
      }
    }
    catch (e) {
      ops.push(LocalStateUpdater.error(e, action.tag))
      switch (e.type) {
        case 'Authorization': {
          ops.push(LocalStateUpdater.revert(this.state, action.payload))
          break
        }
        case 'NetworkFailed': {
          ops.push(LocalStateUpdater.offline())
          break
        }
        default: {
          break
        }
      }
    }
    finally {
      ops.push(LocalStateUpdater.removeNetworkRequest(this.state, action.tag))
      this.assignToState(...ops)
    }
  }

  /**
   * Delete the entity in the CentralState, then unfollow the entity in LocalState.
   */
  async delete<N: EntityNameOf<TM>>(action: DeleteAction<N>) {
    const { LocalStateUpdater } = this.constructor
    const { entityName, id } = action.payload
    this.assignToState(LocalStateUpdater.networkRequest(this.state, action.tag))

    const ops = []
    try {
      await this.client.delete(action.payload)
      ops.push(LocalStateUpdater.unfollow(this.state, entityName, id))
    }
    catch (e) {
      ops.push(LocalStateUpdater.error(e, action.tag))
    }
    finally {
      ops.push(LocalStateUpdater.removeNetworkRequest(this.state, action.tag))
      this.assignToState(...ops)
    }
  }

  /**
   * Register the given entity.
   */
  follow<N: EntityNameOf<TM>>(action: FollowAction<N, EntityOf<TM, N>>) {
    const { LocalStateUpdater } = this.constructor
    const { entityName, entity, versionId } = action.payload
    this.assignToState(LocalStateUpdater.follow(this.state, entityName, entity, versionId))
  }

  /**
   * Register all the given entities.
   */
  followAll<N: EntityNameOf<TM>>(action: FollowAllAction<N, EntityOf<TM, N>>) {
    const { LocalStateUpdater } = this.constructor
    const { entityName, entities, versionsById } = action.payload
    this.assignToState(LocalStateUpdater.followAll(this.state, entityName, entities, versionsById))
  }

  /**
   * Login with credentials, then register the user.
   */
  async login<N: UserEntityNameOf<TM>>(action: LoginAction<N, AuthCommandOf<TM, N>>) {
    const { LocalStateUpdater } = this.constructor
    const command = action.payload

    this.assignToState(LocalStateUpdater.networkRequest(this.state, action.tag))

    let ops = []
    try {
      const result = await this.client.login(command, this.sessionId)
      ops.push(LocalStateUpdater.setSession(this.state, result.session, result.user, result.versionId))
    }
    catch (e) {
      ops.push(LocalStateUpdater.error(e, action.tag))
    }
    finally {
      ops.push(LocalStateUpdater.removeNetworkRequest(this.state, action.tag))
      this.assignToState(...ops)
    }
  }

  /**
   * Remove the session in CentralState and reset the LocalState.
   */
  async logout<N: UserEntityNameOf<TM>>(action: LogoutAction<N>) {
    const command = action.payload
    await this.client.logout(command, this.sessionId)
    this.resetState()
  }

  /**
   * Apply the VersionDiff.
   */
  async patch(action: PatchAction) {
    const { LocalStateUpdater } = this.constructor
    const versionDiff = action.payload
    this.assignToState(LocalStateUpdater.patch(this.state, versionDiff))
  }

  /**
   * Push to the CentralState, then commit to LocalState.
   * If push failed, the commit is not applied.
   */
  async pushAndCommit<N: EntityNameOf<TM>>(action: PushAndCommitAction<N>) {
    const { LocalStateUpdater } = this.constructor
    this.assignToState(LocalStateUpdater.networkRequest(this.state, action.tag))
    //LocalStateUpdater.commit(this.state, action.payload),

    const { operation, id, entityName } = action.payload
    const { versionId, commits } = LocalStateFinder.getEntityInfo(this.state, { entityName, id })
    const operations = commits.slice()
    operations.push(operation)
    const pushCommand: PushCommand<N> = { id, operations, entityName, versionId }

    const ops = []
    try {
      const result = await this.client.push(pushCommand, this.sessionId)
      if (result.hasEntity) {
        ops.push(LocalStateUpdater.follow(this.state, entityName, result.entity, result.versionId))
      }
      else {
        ops.push(LocalStateUpdater.synchronize(this.state, { entityName, id, operations: result.operations, versionId: result.versionId }, operations))
      }
    }
    catch (e) {
      ops.push(LocalStateUpdater.error(e, action.tag))
    }
    finally {
      ops.push(LocalStateUpdater.removeNetworkRequest(this.state, action.tag))
      this.assignToState(...ops)
    }
  }

  /**
   * Pull the differences from CentralState, then rebase the diffs.
   */
  async pull<N: EntityNameOf<TM>>(action: PullAction<N>) {
    const { LocalStateUpdater } = this.constructor
    const { id, entityName } = action.payload
    const { versionId } = LocalStateFinder.getEntityInfo(this.state, action.payload)
    const pullQuery = { id, entityName, versionId }
    const result = await this.client.pull(pullQuery, this.sessionId)

    const ops = []
    if (result.pulled) {
      ops.push(LocalStateUpdater.rebase(this.state, { entityName, id, operations: result.operations, versionId: result.versionId }))
    }
    else {
      ops.push(LocalStateUpdater.follow(this.state, entityName, result.entity, result.versionId))
    }
    this.assignToState(...ops)
  }

  /**
   * Set session info. Register user if exists.
   */
  setSession(action: SetSessionAction) {
    const { LocalStateUpdater } = this.constructor
    const { user, versionId, session } = action.payload
    this.assignToState(LocalStateUpdater.setSession(this.state, session, user, versionId))
  }

  /**
   * Unregister the entity.
   */
  unfollow<N: EntityNameOf<TM>>(action: UnfollowAction<N>) {
    const { LocalStateUpdater } = this.constructor
    const { entityName, id } = action.payload
    this.assignToState(LocalStateUpdater.unfollow(this.state, entityName, id))
  }

  /**
   * Unset session info. It doesn't remove the user info.
   */
  unsetSession() {
    const { LocalStateUpdater } = this.constructor
    this.assignToState(LocalStateUpdater.unsetSession())
  }
}

const MC: Class<MiddlewareCreator<*>> = MiddlewareCreator
export const createMiddleware = MC.create
