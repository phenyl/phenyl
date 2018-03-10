// @flow

import { actions } from './phenyl-redux-module.js'

import { LocalStateUpdater } from './local-state-updater.js'
import { LocalStateFinder } from './local-state-finder.js'

import type {
  CommitAndPushAction,
  DeleteAction,
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
  UnfollowAction,
  UpdateOperation,
} from 'phenyl-interfaces'

type Store = any

type Options = {
  client: RestApiClient,
  storeKey?: string;
}

type Next = (action: PhenylAction) => LocalState

/**
 *
 */
export const createMiddleware = (options: Options) => (store: Store) => (next: Next) => {
  const storeKey = options.storeKey || 'phenyl'
  const client = options.client
  const handler = new MiddlewareHandler(store, storeKey, client, next)

  return (action: PhenylAction) => {
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

/**
 *
 */
export class MiddlewareHandler {
  store: Store
  storeKey: string
  client: RestApiClient
  next: Next

  constructor(store: Store, storeKey: string, client: RestApiClient, next: Next) {
    this.store = store
    this.storeKey = storeKey
    this.client = client
    this.next = next
  }

  /**
   *
   */
  get state(): LocalState {
    return this.store.getState()[this.storeKey]
  }

  /**
   * Invoke reducer 1: Assign operation(s) to state.
   */
  assignToState(...ops: Array<UpdateOperation>): LocalState {
    return this.next(actions.assign(ops))
  }

  /**
   * Invoke reducer 2: Reset state.
   */
  resetState(): LocalState {
    return this.next(actions.reset())
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
  async commitAndPush(action: CommitAndPushAction) {
    const { id, entityName } = action.payload

    this.assignToState(
      LocalStateUpdater.commit(this.state, action.payload),
      LocalStateUpdater.networkRequest(this.state, action.tag)
    )

    const { versionId, commits } = LocalStateFinder.getEntityInfo(this.state, { entityName, id })
    const pushCommand: PushCommand = { id, operations: commits, entityName, versionId }

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
  async delete(action: DeleteAction) {
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
  follow(action: FollowAction) {
    const { entityName, entity, versionId } = action.payload
    this.assignToState(LocalStateUpdater.follow(this.state, entityName, entity, versionId))
  }

  /**
   * Register all the given entities.
   */
  followAll(action: FollowAllAction) {
    const { entityName, entities, versionsById } = action.payload
    this.assignToState(LocalStateUpdater.followAll(this.state, entityName, entities, versionsById))
  }

  /**
   * Login with credentials, then register the user.
   */
  async login(action: LoginAction) {
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
  async logout(action: LogoutAction) {
    const command = action.payload
    await this.client.logout(command, this.sessionId)
    this.resetState()
  }

  /**
   * Apply the VersionDiff.
   */
  async patch(action: PatchAction) {
    const versionDiff = action.payload
    this.assignToState(LocalStateUpdater.patch(this.state, versionDiff))
  }

  /**
   * Push to the CentralState, then commit to LocalState.
   * If push failed, the commit is not applied.
   */
  async pushAndCommit(action: PushAndCommitAction) {
    this.assignToState(LocalStateUpdater.networkRequest(this.state, action.tag))
    //LocalStateUpdater.commit(this.state, action.payload),

    const { operation, id, entityName } = action.payload
    const { versionId, commits } = LocalStateFinder.getEntityInfo(this.state, { entityName, id })
    const operations = commits.slice()
    operations.push(operation)
    const pushCommand: PushCommand = { id, operations, entityName, versionId }

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
  async pull(action: PullAction) {
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
    const { user, versionId, session } = action.payload
    this.assignToState(LocalStateUpdater.setSession(this.state, session, user, versionId))
  }

  /**
   * Unregister the entity.
   */
  unfollow(action: UnfollowAction) {
    const { entityName, id } = action.payload
    this.assignToState(LocalStateUpdater.unfollow(this.state, entityName, id))
  }

  /**
   * Unset session info. It doesn't remove the user info.
   */
  unsetSession() {
    this.assignToState(LocalStateUpdater.unsetSession())
  }
}
