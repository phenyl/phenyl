import {
  Entity,
  GeneralRequestData,
  GeneralResponseData,
  GetCommandResult,
  IdUpdateCommand,
  IdUpdateCommandResult,
  MultiUpdateCommand,
  MultiUpdateCommandResult,
  MultiValuesCommandResult,
  PushCommand,
  PushCommandResult,
  PushResponseData,
  UpdateAndFetchResponseData,
  UpdateAndGetResponseData,
  UpdateMultiResponseData,
  UpdateOneResponseData,
  VersionDiff
} from "@phenyl/interfaces";
/**
 *
 */

export function createVersionDiff(
  reqData: GeneralRequestData,
  resData: GeneralResponseData
): VersionDiff[] {
  if (resData.type === "error") return [];

  switch (reqData.method) {
    case "updateById": {
      const result = (resData as UpdateOneResponseData).payload;
      const versionDiff = createVersionDiffByIdUpdateCommand(
        reqData.payload,
        result
      );
      return versionDiff ? [versionDiff] : [];
    }

    case "updateMulti": {
      const result = (resData as UpdateMultiResponseData).payload;

      return createVersionDiffByMultiUpdateCommand(
        reqData.payload,
        result
      ).filter(notEmpty);
    }

    case "updateAndGet": {
      const versionDiff = createVersionDiffByIdUpdateCommand(
        reqData.payload,
        (resData as UpdateAndGetResponseData<Entity>).payload
      );
      return versionDiff ? [versionDiff] : [];
    }

    case "updateAndFetch": {
      const result = (resData as UpdateAndFetchResponseData<Entity>).payload;

      return createVersionDiffByMultiUpdateCommand(
        reqData.payload,
        result
      ).filter(notEmpty);
    }

    case "push": {
      const result = (resData as PushResponseData<Entity>).payload;
      const versionDiff = createVersionDiffByPushCommand(
        reqData.payload,
        result
      );
      return versionDiff ? [versionDiff] : [];
    }

    default:
      return [];
  }
}

function createVersionDiffByIdUpdateCommand<
  EN extends string,
  E extends Entity
>(
  command: IdUpdateCommand<EN>,
  result: IdUpdateCommandResult | GetCommandResult<E>
): VersionDiff | undefined | null {
  const { versionId, prevVersionId } = result;

  if (versionId && prevVersionId) {
    const { entityName, id, operation } = command;
    return {
      entityName,
      id,
      operation,
      versionId,
      prevVersionId
    };
  }

  return null;
}

function createVersionDiffByMultiUpdateCommand<
  EN extends string,
  E extends Entity
>(
  command: MultiUpdateCommand<EN>,
  result: MultiValuesCommandResult<E> | MultiUpdateCommandResult
): Array<VersionDiff | undefined | null> {
  const { versionsById, prevVersionsById } = result;
  if (!versionsById || !prevVersionsById) return [];
  const { entityName, operation } = command;

  return Object.keys(versionsById).map(entityId => {
    const versionId = versionsById[entityId];
    const prevVersionId = prevVersionsById[entityId];

    if (versionId && prevVersionId) {
      return {
        entityName,
        id: entityId,
        operation,
        versionId,
        prevVersionId
      };
    }

    return null;
  });
}

function createVersionDiffByPushCommand<EN extends string, E extends Entity>(
  command: PushCommand<EN>,
  result: PushCommandResult<E>
): VersionDiff | undefined | null {
  const { versionId, prevVersionId, newOperation } = result;

  if (versionId && prevVersionId) {
    const { entityName, id } = command;
    return {
      entityName,
      id,
      operation: newOperation,
      versionId,
      prevVersionId
    };
  }

  return null;
}

// Thanks to https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
