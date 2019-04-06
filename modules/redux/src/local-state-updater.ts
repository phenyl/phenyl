import { update, createDocumentPath } from 'sp2'
import { createLocalError } from '@phenyl/utils'
import { removeOne } from './utils'
import {
  ActionTag,
  Id,
  IdUpdateCommand,
  EntityMapOf,
  EntityNameOf,
  EntityOf,
  LocalState,
  PhenylError,
  PushCommand,
  Session,
  TypeMap,
  UpdateOperation,
  UserEntityNameOf,
  VersionDiff,
  CommitAction,
  UnreachedCommit,
  GeneralReqResEntityMap,
  GeneralAuthCommandMap,
  Key,
  GeneralTypeMap,
} from '@phenyl/interfaces'
import { LocalStateFinder } from './local-state-finder.js'
type LocalStateOf = LocalState<GeneralReqResEntityMap, GeneralAuthCommandMap>

type EntityName = string
type RevertCommand<N extends EntityName> = {
  entityName: N
  id: Id
  operations: Array<UpdateOperation>
}
/**
 *
 */

export class LocalStateUpdater {
  // static LocalStateFinder: Class<LocalStateFinder<TM>> = LocalStateFinder

  /**
   * Initialize the given entity field.
   */
  static initialize<M extends GeneralReqResEntityMap, EN extends Key<M>>(
    state: LocalStateOf,
    entityName: EN,
  ): UpdateOperation {
    return {
      $set: {
        [createDocumentPath('entities', entityName)]: {},
      },
    }
  }
  /**
   * Commit the operation of entity to LocalState.
   * Error is thrown when no entity is registered.
   */

  static commit<GM extends GeneralTypeMap, EN extends Key<GM>>(
    state: LocalStateOf,
    command: IdUpdateCommand<EN>,
  ): UpdateOperation {
    const { entityName, id, operation } = command

    if (
      !LocalStateFinder.hasEntity(state, {
        entityName,
        id,
      })
    ) {
      throw new Error(
        `LocalStateUpdater.commit(). No entity found. entityName: "${entityName}", id: "${id}".`,
      )
    }

    const entity = LocalStateFinder.getHeadEntity(state, {
      id,
      entityName,
    })
    const newEntity = update(entity, operation)
    return {
      $push: {
        [createDocumentPath('entities', entityName, id, 'commits')]: operation,
      },
      $set: {
        [createDocumentPath('entities', entityName, id, 'head')]: newEntity,
      },
    }
  }
  /**
   * Revert the already applied commit.
   * Error is thrown when no entity is registered.
   */

  static revert<GM extends GeneralTypeMap, N extends EntityNameOf<GM>>(
    state: LocalStateOf,
    command: RevertCommand<N>,
  ): UpdateOperation {
    const { entityName, id, operations } = command

    if (
      !LocalStateFinder.hasEntity(state, {
        entityName,
        id,
      })
    ) {
      throw new Error(
        `LocalStateUpdater.revert(). No entity found. entityName: "${entityName}", id: "${id}".`,
      )
    }

    const entityInfo = LocalStateFinder.getEntityInfo(state, {
      id,
      entityName,
    })
    const commits = operations.reduce(
      (restCommits, op) => removeOne(restCommits, op),
      entityInfo.commits,
    )
    const restoredHead = update(entityInfo.origin, ...commits)
    return {
      $set: {
        [createDocumentPath('entities', entityName, id, 'commits')]: commits,
        [createDocumentPath('entities', entityName, id, 'head')]: restoredHead,
      },
    }
  }
  /**
   * Register the entity info into LocalState.
   * Overwrite if already exists.
   */

  static follow<N extends EntityNameOf<TM>>(
    state: LocalStateOf<TM>,
    entityName: N,
    entity: EntityOf<TM, N>,
    versionId: Id | undefined | null,
  ): UpdateOperation {
    return {
      $set: {
        [createDocumentPath('entities', entityName, entity.id)]: {
          origin: entity,
          versionId,
          commits: [],
          head: null,
        },
      },
    }
  }
  /**
   * Remove the entity info from LocalState.
   */

  static unfollow<N extends EntityNameOf<TM>>(
    state: LocalStateOf<TM>,
    entityName: N,
    id: Id,
  ): UpdateOperation {
    return {
      $unset: {
        [createDocumentPath('entities', entityName, id)]: '',
      },
    }
  }
  /**
   * Push network request promise.
   */

  static addUnreachedCommits<N extends EntityNameOf<TM>>(
    state: LocalStateOf<TM>,
    commit: UnreachedCommit<N>,
  ): UpdateOperation {
    const { entityName, id, commitCount } = commit
    const enqueuedCount = state.unreachedCommits
      .filter(c => c.entityName === entityName && c.id === id)
      .reduce((acc, c) => acc + c.commitCount, 0)

    if (commitCount <= enqueuedCount) {
      return {}
    }

    return {
      $push: {
        [createDocumentPath('unreachedCommits')]: {
          entityName,
          id,
          commitCount: commitCount - enqueuedCount,
        },
      },
    }
  }
  /**
   * Remove network request promise from the request queue.
   */

  static removeUnreachedCommits<N extends EntityNameOf<TM>>(
    state: LocalStateOf<TM>,
    commit: UnreachedCommit<N>,
  ): UpdateOperation {
    return {
      $pull: {
        [createDocumentPath('unreachedCommits')]: {
          $in: [commit],
        },
      },
    }
  }
  /**
   * Push network request promise.
   */

  static networkRequest(
    state: LocalStateOf<TM>,
    tag: ActionTag,
  ): UpdateOperation {
    return {
      $push: {
        [createDocumentPath('network', 'requests')]: tag,
      },
    }
  }
  /**
   * Remove network request promise from the request queue.
   */

  static removeNetworkRequest(
    state: LocalStateOf<TM>,
    tag: ActionTag,
  ): UpdateOperation {
    return {
      $set: {
        [createDocumentPath('network', 'requests')]: removeOne(
          state.network.requests,
          tag,
        ),
      },
    }
  }
  /**
   * Apply the given VersionDiff as a patch.
   * If the diff's prevVersionId isn't equal to registered versionId, no operation is returned.
   * If it equals, applied to origin.
   */

  static patch(
    state: LocalStateOf<TM>,
    versionDiff: VersionDiff,
  ): UpdateOperation {
    const { entityName, id, versionId, prevVersionId, operation } = versionDiff
    const entityInfo = LocalStateFinder.getEntityInfo(state, {
      id,
      entityName,
    }) // Not applicable diff.

    if (entityInfo.versionId !== prevVersionId) {
      return {}
    }

    const newOrigin = update(entityInfo.origin, operation)
    const newHead = update(newOrigin, ...entityInfo.commits)
    return {
      $set: {
        [createDocumentPath('entities', entityName, id, 'origin')]: newOrigin,
        [createDocumentPath(
          'entities',
          entityName,
          id,
          'versionId',
        )]: versionId,
        [createDocumentPath('entities', entityName, id, 'head')]: newHead,
      },
    }
  }
  /**
   * Apply the master commits.
   * If local commits exist, apply them after master commits.
   */

  static rebase<N extends EntityNameOf<TM>>(
    state: LocalStateOf<TM>,
    pushCommand: PushCommand<N>,
  ): UpdateOperation {
    const { entityName, id, versionId, operations } = pushCommand
    const entityInfo = LocalStateFinder.getEntityInfo(state, {
      id,
      entityName,
    })
    const newOrigin = update(entityInfo.origin, ...operations)
    const newHead =
      entityInfo.commits.length > 0
        ? update(newOrigin, ...entityInfo.commits)
        : null
    return {
      $set: {
        [createDocumentPath('entities', entityName, id, 'origin')]: newOrigin,
        [createDocumentPath(
          'entities',
          entityName,
          id,
          'versionId',
        )]: versionId,
        [createDocumentPath('entities', entityName, id, 'head')]: newHead,
      },
    }
  }
  /**
   * Apply the master commits, then apply the given local commits.
   */

  static synchronize<N extends EntityNameOf<TM>>(
    state: LocalStateOf<TM>,
    pushCommand: PushCommand<N>,
    localCommits: Array<UpdateOperation>,
  ): UpdateOperation {
    const { entityName, id, operations, versionId } = pushCommand
    const entityInfo = LocalStateFinder.getEntityInfo(state, {
      id,
      entityName,
    })
    const newOrigin = update(entityInfo.origin, ...operations, ...localCommits) // assert(localCommits.length === 0 || entityInfo.commits[0] === localCommits[0])

    const newCommits = entityInfo.commits.slice(localCommits.length)
    const newHead =
      newCommits.length > 0 ? update(newOrigin, ...newCommits) : null
    return {
      $set: {
        [createDocumentPath('entities', entityName, id)]: {
          origin: newOrigin,
          versionId,
          commits: newCommits,
          head: newHead,
        },
      },
    }
  }
  /**
   * Register all the entities into LocalState.
   * NOTICE: if returned type of this.follow() changes, this implementation must be changed.
   */

  static followAll<N extends EntityNameOf<TM>>(
    state: LocalStateOf<TM>,
    entityName: N,
    entities: Array<EntityOf<TM, N>>,
    versionsById: {
      [entityId: Id]: Id
    },
  ): UpdateOperation {
    const $setOp = {}

    for (const entity of entities) {
      const versionId = versionsById[entity.id]
      const operation = this.follow(state, entityName, entity, versionId)
      Object.assign($setOp, operation.$set)
    }

    return {
      $set: $setOp,
    }
  }
  /**
   * Set session.
   */

  static setSession<N extends UserEntityNameOf<TM>>(
    state: LocalStateOf<TM>,
    session: Session,
    user: EntityOf<TM, N> | undefined | null,
    versionId?: Id | undefined | null,
  ): UpdateOperation {
    const { entityName } = session
    const operation = {
      $set: {
        session,
      },
    }

    if (user != null && versionId != null) {
      const followOp = this.follow(state, entityName, user, versionId)
      Object.assign(operation.$set, followOp.$set)
    }

    return operation
  }
  /**
   * Remove session.
   */

  static unsetSession(): UpdateOperation {
    return {
      $unset: {
        session: '',
      },
    }
  }
  /**
   * Set Error.
   */

  static error(e: Error | PhenylError, actionTag: ActionTag): UpdateOperation {
    const err = e.type && e.at ? e : createLocalError(e)
    return {
      $set: {
        error: {
          // $FlowIssue(err.type-exists)
          type: err.type,
          // $FlowIssue(err.at-exists)
          at: err.at,
          message: err.message,
          actionTag,
        },
      },
    }
  }
  /**
   * Set network state Online.
   */

  static online(): UpdateOperation {
    return {
      $set: {
        [createDocumentPath('network', 'isOnline')]: true,
      },
    }
  }
  /**
   * Set network state Offline.
   */

  static offline(): UpdateOperation {
    return {
      $set: {
        [createDocumentPath('network', 'isOnline')]: false,
      },
    }
  }
  /**
   * Unset error.
   */

  static resolveError(): UpdateOperation {
    return {
      $unset: {
        [createDocumentPath('error')]: '',
      },
    }
  }
}
