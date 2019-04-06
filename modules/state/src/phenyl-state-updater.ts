import {
  DeleteCommand,
  EntityState,
  EntityStateUpdater,
  GeneralEntityMap,
  IdDeleteCommand,
  IdUpdateCommand,
  Key,
  MultiDeleteCommand,
  MultiUpdateCommand
} from "@phenyl/interfaces";
import {
  GeneralUpdateOperation,
  UpdateOperand,
  mergeUpdateOperations,
  retargetOperation
} from "sp2";

import PhenylStateFinder from "./phenyl-state-finder";

/**
 *
 */

export default class PhenylStateUpdater<M extends GeneralEntityMap>
  implements EntityStateUpdater<M> {
  state: EntityState<M>;

  constructor(state: EntityState<M>) {
    this.state = state;
  }

  /**
   *
   */
  updateById<EN extends Key<M>>(
    command: IdUpdateCommand<EN>
  ): GeneralUpdateOperation {
    return PhenylStateUpdater.updateById(this.state, command);
  }

  /**
   *
   */
  updateMulti<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>
  ): GeneralUpdateOperation {
    return PhenylStateUpdater.updateMulti(this.state, command);
  }

  /**
   * Register entities.
   * As RestorablePreEntities in InsertCommand does not have "id",
   * PhenylState cannot handle InsertCommand.
   * Instead, it receives in entities created in server.
   */
  register<EN extends Key<M>>(
    entityName: EN,
    ...entities: M[EN][]
  ): GeneralUpdateOperation {
    return PhenylStateUpdater.register(this.state, entityName, ...entities);
  }

  /**
   *
   */
  delete<EN extends Key<M>>(
    command: DeleteCommand<EN>
  ): GeneralUpdateOperation {
    return PhenylStateUpdater.delete(this.state, command);
  }

  /**
   *
   */
  deleteById<EN extends Key<M>>(
    command: IdDeleteCommand<EN>
  ): GeneralUpdateOperation {
    return PhenylStateUpdater.deleteById(this.state, command);
  }

  /**
   *
   */
  deleteByFindOperation<EN extends Key<M>>(
    command: MultiDeleteCommand<EN>
  ): GeneralUpdateOperation {
    return PhenylStateUpdater.deleteByFindOperation(this.state, command);
  }

  /**
   *
   */
  static updateById<M extends GeneralEntityMap, EN extends Key<M>>(
    state: EntityState<M>,
    command: IdUpdateCommand<EN>
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
    return retargetOperation(docPath, operation);
  }

  /**
   *
   */
  static updateMulti<M extends GeneralEntityMap, EN extends Key<M>>(
    state: EntityState<M>,
    command: MultiUpdateCommand<EN>
  ): GeneralUpdateOperation {
    const { where, entityName, operation } = command;
    const targetEntities = PhenylStateFinder.find(state, {
      entityName,
      where
    });
    const operationList = targetEntities.map(targetEntity => {
      const docPath = ["pool", entityName, targetEntity.id].join(".");
      return retargetOperation(docPath, operation);
    });
    return mergeUpdateOperations(...operationList);
  }

  /**
   * Register entities.
   * As RestorablePreEntities in InsertCommand does not have "id",
   * PhenylState cannot handle InsertCommand.
   * Instead, it receives in entities created in server.
   */
  static register<M extends GeneralEntityMap, EN extends Key<M>>(
    state: EntityState<M>,
    entityName: EN,
    ...entities: M[EN][]
  ): GeneralUpdateOperation {
    const operationList = entities.map(entity => {
      const docPath = ["pool", entityName, entity.id].join(".");
      return {
        $set: {
          [docPath]: entity
        }
      };
    });
    return mergeUpdateOperations(...operationList);
  }
  /**
   *
   */

  static delete<M extends GeneralEntityMap, EN extends Key<M>>(
    state: EntityState<M>,
    command: DeleteCommand<EN>
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

  static deleteById<M extends GeneralEntityMap, EN extends Key<M>>(
    state: EntityState<M>,
    command: IdDeleteCommand<EN>
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

  static deleteByFindOperation<M extends GeneralEntityMap, EN extends Key<M>>(
    state: EntityState<M>,
    command: MultiDeleteCommand<EN>
  ): GeneralUpdateOperation {
    const { where, entityName } = command;
    const targetEntities = PhenylStateFinder.find(state, {
      entityName,
      where
    });
    const $unset: UpdateOperand<"$unset"> = {};
    targetEntities.forEach(targetEntity => {
      const docPath = ["pool", entityName, targetEntity.id].join(".");
      $unset[docPath] = "";
    });
    return {
      $unset
    };
  }
}
