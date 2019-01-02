import {
  RequestData,
  ResponseData,
  VersionDiff,
  IdUpdateCommand,
  IdUpdateCommandResult,
  MultiUpdateCommand,
  GetCommandResult,
  PushCommand,
  PushCommandResult,
  MultiValuesCommandResult,
} from 'phenyl-interfaces'
/**
 *
 */

export function createVersionDiff(reqData: RequestData, resData: ResponseData): Array<VersionDiff> {
  if (resData.type === 'error') return []

  switch (reqData.method) {
    case 'updateById': {
      // $FlowIssue(resData-has-versionId)
      const result: CommandResult = resData.payload
      const versionDiff = createVersionDiffByIdUpdateCommand(reqData.payload, result)
      return versionDiff ? [versionDiff] : []
    }

    case 'updateMulti': {
      // $FlowIssue(resData.payload-is-MultiValuesCommandResult)
      const result: MultiValuesCommandResult = resData.payload // $FlowIssue(null-value-is-filtered)

      return createVersionDiffByMultiUpdateCommand(reqData.payload, result).filter(v => v != null)
    }

    case 'updateAndGet': {
      // $FlowIssue(resData.payload-is-GetCommandREsult)
      const versionDiff = createVersionDiffByIdUpdateCommand(reqData.payload, resData.payload)
      return versionDiff ? [versionDiff] : []
    }

    case 'updateAndFetch': {
      // $FlowIssue(resData.payload-is-MultiValuesCommandResult)
      const result: MultiValuesCommandResult = resData.payload // $FlowIssue(null-value-is-filtered)

      return createVersionDiffByMultiUpdateCommand(reqData.payload, result).filter(v => v)
    }

    case 'push': {
      // $FlowIssue(resData.payload-is-PushCommandResult)
      const result: PushCommandResult = resData.payload
      const versionDiff = createVersionDiffByPushCommand(reqData.payload, result)
      return versionDiff ? [versionDiff] : []
    }

    default:
      return []
  }
}

function createVersionDiffByIdUpdateCommand(
  command: IdUpdateCommand<>,
  result: IdUpdateCommandResult | GetCommandResult<>,
): VersionDiff | undefined | null {
  const { versionId, prevVersionId } = result

  if (versionId && prevVersionId) {
    const { entityName, id, operation } = command
    return {
      entityName,
      id,
      operation,
      versionId,
      prevVersionId,
    }
  }

  return null
}

function createVersionDiffByMultiUpdateCommand(
  command: MultiUpdateCommand<>,
  result: MultiValuesCommandResult<>,
): Array<VersionDiff | undefined | null> {
  const { versionsById, prevVersionsById } = result
  if (!versionsById || !prevVersionsById) return []
  const { entityName, operation } = command // $FlowIssue(returns-non-null-value-with-filter(v => v))

  return Object.keys(versionsById).map(entityId => {
    const versionId = versionsById[entityId]
    const prevVersionId = prevVersionsById[entityId]

    if (versionId && prevVersionId) {
      return {
        entityName,
        id: entityId,
        operation,
        versionId,
        prevVersionId,
      }
    }

    return null
  })
}

function createVersionDiffByPushCommand(
  command: PushCommand<>,
  result: PushCommandResult<>,
): VersionDiff | undefined | null {
  const { versionId, prevVersionId, newOperation } = result

  if (versionId && prevVersionId) {
    const { entityName, id } = command
    return {
      entityName,
      id,
      operation: newOperation,
      versionId,
      prevVersionId,
    }
  }

  return null
}
