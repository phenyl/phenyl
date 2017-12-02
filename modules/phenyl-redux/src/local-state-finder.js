// @flow

import type {
  IdQuery,
  Entity,
  LocalState,
  LocalEntityInfo,
} from 'phenyl-interfaces'

/**
 * Get value(s) of LocalState.
 */
export class LocalStateFinder {

  /**
   * Check if LocalState has given id and entityName.
   */
  static hasEntity(state: LocalState, query: IdQuery): boolean {
    const { entityName, id } = query
    if (!state.entities[entityName]) return false
    return state.entities[entityName][id] != null
  }

  /**
   * Get head entity by id and entityName.
   * "head" is like git's "HEAD", the current entity in local state.
   */
  static getHeadEntity(state: LocalState, query: IdQuery): Entity {
    const { entityName, id } = query
    if (state.entities[entityName] == null) throw new Error(`LocalStateFinder#getHeadEntity(). No entityName found: "${entityName}".`)
    const entityInfo = state.entities[entityName][id]
    if (entityInfo == null) throw new Error(`LocalStateFinder#getHeadEntity(). No id found in entityName: "${entityName}". id: "${id}".`)

    // If no head, meaning origin is the head (= commits.length === 0)
    return entityInfo.head ? entityInfo.head : entityInfo.origin
  }

  /**
   * Get LocalEntityInfo by id and entityName.
   * It contains origin, head, commits and versionId.
   * head may be null.
   */
  static getEntityInfo(state: LocalState, query: IdQuery): LocalEntityInfo {
    const { entityName, id } = query
    if (state.entities[entityName] == null) throw new Error(`LocalStateFinder#getEntityInfo(). No entityName found: "${entityName}".`)
    const entityInfo = state.entities[entityName][id]
    if (entityInfo == null) throw new Error(`LocalStateFinder#getEntityInfo(). No id found in entityName: "${entityName}". id: "${id}".`)

    return entityInfo
  }

}
