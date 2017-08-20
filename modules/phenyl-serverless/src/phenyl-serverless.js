// @flow
import {
  assertValidOperation,
} from 'phenyl-utils'

import {
  normalizeCustomHandlers,
} from './create-custom-execution-handlers'

import type {
  Id,
  Operation,
  OperationResult,
  PhenylClient,
  AclHandler,
  ValidationHandler,
  SessionClient,
  CustomQueryHandler,
  CustomCommandHandler,
} from 'phenyl-interfaces'

import type {
  CustomExecutionHandlers,
} from './create-custom-execution-handlers'

type LambdaEvent = Object // TODO
type LambdaContext = Object // TODO
type LambdaResponse = Object // TODO
type LambdaHandler = (event: LambdaEvent, context: LambdaContext) => Promise<LambdaResponse>

type ServerlessParams = {
  aclHandler: AclHandler,
  validationHandler: ValidationHandler,
  client: PhenylClient,
  sessionClient: SessionClient,
  custom?: CustomExecutionHandlers,
}

/**
 *
 */
export default class PhenylServerless {
  aclHandler: AclHandler
  validationHandler: ValidationHandler
  client: PhenylClient
  sessionClient: SessionClient
  custom: CustomExecutionHandlers

  constructor(params: ServerlessParams) {
    this.aclHandler = params.aclHandler
    this.validationHandler = params.validationHandler
    this.client = params.client
    this.sessionClient = params.sessionClient

    this.custom = normalizeCustomHandlers(params.custom)
  }

  /**
   * @public
   */
  getLambdaHandler(): LambdaHandler {
    return (event: LambdaEvent, context: LambdaContext): Promise<LambdaResponse> => {
      const { operation, sessionId } = context
      return this.run(operation, sessionId)
    }
  }

  /**
   *
   */
  async run(operation: Operation, sessionId: ?Id): Promise<OperationResult> {
    const session = await this.sessionClient.get(sessionId)

    assertValidOperation(operation)

    const isAccessible = await this.aclHandler(operation, session, this.client)
    if (!isAccessible) {
      throw new Error('Authorization Required.')
    }

    const isValid = await this.validationHandler(operation, session, this.client)
    if (!isValid) {
      throw new Error('Params are not valid.')
    }

    if (operation.find != null) {
      const result = await this.client.find(operation.find)
      return { find: result }
    }
    if (operation.findOne != null) {
      const result = await this.client.findOne(operation.findOne)
      return { findOne: result }
    }
    if (operation.get != null) {
      const result = await this.client.get(operation.get)
      return { get: result }
    }
    if (operation.getByIds != null) {
      const result = await this.client.getByIds(operation.getByIds)
      return { getByIds: result }
    }
    if (operation.insert != null) {
      const result = await this.client.insert(operation.insert)
      return { insert: result }
    }
    if (operation.insertAndGet != null) {
      const result = await this.client.insertAndGet(operation.insertAndGet)
      return { insertAndGet: result }
    }
    if (operation.insertAndFetch != null) {
      const result = await this.client.insertAndFetch(operation.insertAndFetch)
      return { insertAndFetch: result }
    }
    if (operation.update != null) {
      const result = await this.client.update(operation.update)
      return { update: result }
    }
    if (operation.updateAndGet != null) {
      const result = await this.client.updateAndGet(operation.updateAndGet)
      return { updateAndGet: result }

    }
    if (operation.updateAndFetch != null) {
      const result = await this.client.updateAndFetch(operation.updateAndFetch)
      return { updateAndFetch: result }
    }
    if (operation.delete != null) {
      const result = await this.client.delete(operation.delete)
      return { delete: result }
    }

    if (operation.runCustomQuery != null) {
      const result = await this.custom.queryHandler(operation.runCustomQuery, session, this.client)
      return { runCustomQuery: result }
    }
    if (operation.runCustomCommand != null) {
      const result = await this.custom.commandHandler(operation.runCustomCommand, session, this.client)
      return { runCustomCommand: result }
    }

    throw new Error('Invalid operation.')
  }
}
