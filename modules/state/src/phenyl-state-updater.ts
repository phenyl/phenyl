import { retargetToProp, mergeOperations } from "power-assign";
import {
  DeleteCommand,
  GeneralReqResEntityMap,
  EntityState,
  EntityStateUpdater,
  IdUpdateCommand,
  IdDeleteCommand,
  MultiUpdateCommand,
  MultiDeleteCommand,
  Key
} from "@phenyl/interfaces";
import { GeneralUpdateOperation } from "@sp2/updater";
import PhenylStateFinder from "./phenyl-state-finder.js";

/**
 *
 */

export default class PhenylStateUpdater<M extends GeneralReqResEntityMap>
  implements EntityStateUpdater<M> {
  state: EntityState<M>;

  constructor(state: EntityState<M>) {
    this.state = state;
  }

  /**
   *
   */
  updateById(command: IdUpdateCommand<Key<M>>): GeneralUpdateOperation {
    return PhenylStateUpdater.updateById(this.state, command);
  }

  /**
   *
   */
  updateMulti(command: MultiUpdateCommand<Key<M>>): GeneralUpdateOperation {
    return PhenylStateUpdater.updateMulti(this.state, command);
  }

  /**
   * Register entities.
   * As RestorablePreEntities in InsertCommand does not have "id",
   * PhenylState cannot handle InsertCommand.
   * Instead, it receives in entities created in server.
   */
  register(
    entityName: Key<M>,
    ...entities: Array<M[Key<M>]>
  ): GeneralUpdateOperation {
    return PhenylStateUpdater.register(this.state, entityName, ...entities);
  }

  /**
   *
   */
  delete(command: DeleteCommand<Key<M>>): GeneralUpdateOperation {
    return PhenylStateUpdater.delete(this.state, command);
  }

  /**
   *
   */
  deleteById(command: IdDeleteCommand<Key<M>>): GeneralUpdateOperation {
    return PhenylStateUpdater.deleteById(this.state, command);
  }

  /**
   *
   */
  deleteByFindOperation(
    command: MultiDeleteCommand<Key<M>>
  ): GeneralUpdateOperation {
    return PhenylStateUpdater.deleteByFindOperation(this.state, command);
  }

  /**
   *
   */
  static updateById<M extends GeneralReqResEntityMap>(
    state: EntityState<M>,
    command: IdUpdateCommand<Key<M>>
  ): GeneralUpdateOperation {
    const { id, entityName, operation } = command;

    if (
      !PhenylStateFinder.has(state, {
        entityName,
        id
      })
    ) {
      throw new Error("Could not find any entity to update.");
    }

    const docPath = ["pool", entityName, id].join(".");
    return retargetToProp(docPath, operation);
  }

  /**
   *
   */
  static updateMulti<M extends GeneralReqResEntityMap>(
    state: EntityState<M>,
    command: MultiUpdateCommand<Key<M>>
  ): GeneralUpdateOperation {
    const { where, entityName, operation } = command;
    const targetEntities = PhenylStateFinder.find(state, {
      entityName,
      where
    });
    const operationList = targetEntities.map(targetEntity => {
      const docPath = ["pool", entityName, targetEntity.id].join(".");
      return retargetToProp(docPath, operation);
    });
    return mergeOperations(...operationList);
  }

  /**
   * Register entities.
   * As RestorablePreEntities in InsertCommand does not have "id",
   * PhenylState cannot handle InsertCommand.
   * Instead, it receives in entities created in server.
   */
  static register<M extends GeneralReqResEntityMap>(
    state: EntityState<M>,
    entityName: string,
    ...entities: Array<M[Key<M>]>
  ): GeneralUpdateOperation {
    const operationList = entities.map(entity => {
      const docPath = ["pool", entityName, entity.id].join(".");
      return {
        $set: {
          [docPath]: entity
        }
      };
    });
    return mergeOperations(...operationList);
  }
  /**
   *
   */

  static delete<M extends GeneralReqResEntityMap>(
    state: EntityState<M>,
    command: DeleteCommand<Key<M>>
  ): GeneralUpdateOperation {
    if ((command as MultiDeleteCommand<Key<M>>).where) {
      return this.deleteByFindOperation(state, command as MultiDeleteCommand<
        Key<M>
      >);
    }

    return this.deleteById(state, command as IdDeleteCommand<Key<M>>);
  }
  /**
   *
   */

  static deleteById<M extends GeneralReqResEntityMap>(
    state: EntityState<M>,
    command: IdDeleteCommand<Key<M>>
  ): GeneralUpdateOperation {
    const { id, entityName } = command;
    const docPath = ["pool", entityName, id].join(".");
    return {
      $unset: {
        [docPath]: ""
      }
    };
  }
  /**
   *
   */

  static deleteByFindOperation<M extends GeneralReqResEntityMap>(
    state: EntityState<M>,
    command: MultiDeleteCommand<Key<M>>
  ): GeneralUpdateOperation {
    const { where, entityName } = command;
    const targetEntities = PhenylStateFinder.find(state, {
      entityName,
      where
    });
    const $unset: GeneralUpdateOperation = {};
    targetEntities.forEach(targetEntity => {
      const docPath = ["pool", entityName, targetEntity.id].join(".");
      $unset[docPath] = "";
    });
    return {
      $unset
    };
  }
}
