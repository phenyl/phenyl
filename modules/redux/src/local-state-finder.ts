import {
  LocalEntityInfo,
  GeneralTypeMap,
  EntityNameOf,
  LocalStateOf,
  ResponseEntityOf,
  IdQuery
} from "@phenyl/interfaces";
import { getNestedValue, createDocumentPath } from "sp2";

/**
 * Get value(s) of LocalState.
 */

export class LocalStateFinder {
  /**
   * Check if LocalState has given id and entityName.
   */
  static hasEntityField<TM extends GeneralTypeMap, EN extends EntityNameOf<TM>>(
    state: LocalStateOf<TM>,
    entityName: EN
  ): boolean {
    return state.entities[entityName] != null;
  }

  /**
   * Check if LocalState has given id and entityName.
   */
  static hasEntity<TM extends GeneralTypeMap, EN extends EntityNameOf<TM>>(
    state: LocalStateOf<TM>,
    query: IdQuery<EN>
  ): boolean {
    const { entityName, id } = query;
    if (!state.entities[entityName]) return false;
    const entityInfo = getNestedValue(
      state,
      createDocumentPath("entities", entityName, id)
    );
    return entityInfo != null;
  }

  /**
   * Get head entity by id and entityName.
   * "head" is like git's "HEAD", the current entity in local state.
   */
  static getHeadEntity<TM extends GeneralTypeMap, EN extends EntityNameOf<TM>>(
    state: LocalStateOf<TM>,
    query: IdQuery<EN>
  ): ResponseEntityOf<TM, EN> {
    const { entityName, id } = query;
    if (state.entities[entityName] == null)
      throw new Error(
        `LocalStateFinder#getHeadEntity(). No entityName found: "${entityName}".`
      );
    const entityInfo = getNestedValue(
      state,
      createDocumentPath("entities", entityName, id)
    );
    if (entityInfo == null)
      throw new Error(
        `LocalStateFinder#getHeadEntity(). No id found in entityName: "${entityName}". id: "${id}".`
      ); // If no head, meaning origin is the head (= commits.length === 0)

    return entityInfo.head ? entityInfo.head : entityInfo.origin;
  }

  /**
   * Get LocalEntityInfo by id and entityName.
   * It contains origin, head, commits and versionId.
   * head may be null.
   */
  static getEntityInfo<TM extends GeneralTypeMap, EN extends EntityNameOf<TM>>(
    state: LocalStateOf<TM>,
    query: IdQuery<EN>
  ): LocalEntityInfo<ResponseEntityOf<TM, EN>> {
    const { entityName, id } = query;
    if (state.entities[entityName] == null)
      throw new Error(
        `LocalStateFinder#getEntityInfo(). No entityName found: "${entityName}".`
      );
    const entityInfo = getNestedValue(
      state,
      createDocumentPath("entities", entityName, id)
    );
    if (entityInfo == null)
      throw new Error(
        `LocalStateFinder#getEntityInfo(). No id found in entityName: "${entityName}". id: "${id}".`
      );
    return entityInfo;
  }
}
