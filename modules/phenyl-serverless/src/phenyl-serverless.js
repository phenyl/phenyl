// @flow
import {
  assertValidRequest,
} from 'phenyl-utils'

import {
  normalizeCustomHandlers,
} from './create-custom-execution-handlers'

import type {
  Id,
  Request,
  Response,
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
      const { request, sessionId } = context
      return this.run(request, sessionId)
    }
  }

  /**
   *
   */
  async run(request: Request, sessionId: ?Id): Promise<Response> {
    const session = await this.sessionClient.get(sessionId)

    assertValidRequest(request)

    const isAccessible = await this.aclHandler(request, session, this.client)
    if (!isAccessible) {
      throw new Error('Authorization Required.')
    }

    const isValid = await this.validationHandler(request, session, this.client)
    if (!isValid) {
      throw new Error('Params are not valid.')
    }

    if (request.find != null) {
      const result = await this.client.find(request.find)
      return { find: result }
    }
    if (request.findOne != null) {
      const result = await this.client.findOne(request.findOne)
      return { findOne: result }
    }
    if (request.get != null) {
      const result = await this.client.get(request.get)
      return { get: result }
    }
    if (request.getByIds != null) {
      const result = await this.client.getByIds(request.getByIds)
      return { getByIds: result }
    }
    if (request.insert != null) {
      const result = await this.client.insert(request.insert)
      return { insert: result }
    }
    if (request.insertAndGet != null) {
      const result = await this.client.insertAndGet(request.insertAndGet)
      return { insertAndGet: result }
    }
    if (request.insertAndFetch != null) {
      const result = await this.client.insertAndFetch(request.insertAndFetch)
      return { insertAndFetch: result }
    }
    if (request.update != null) {
      const result = await this.client.update(request.update)
      return { update: result }
    }
    if (request.updateAndGet != null) {
      const result = await this.client.updateAndGet(request.updateAndGet)
      return { updateAndGet: result }

    }
    if (request.updateAndFetch != null) {
      const result = await this.client.updateAndFetch(request.updateAndFetch)
      return { updateAndFetch: result }
    }
    if (request.delete != null) {
      const result = await this.client.delete(request.delete)
      return { delete: result }
    }

    if (request.runCustomQuery != null) {
      const result = await this.custom.queryHandler(request.runCustomQuery, session, this.client)
      return { runCustomQuery: result }
    }
    if (request.runCustomCommand != null) {
      const result = await this.custom.commandHandler(request.runCustomCommand, session, this.client)
      return { runCustomCommand: result }
    }

    throw new Error('Invalid request.')
  }
}
