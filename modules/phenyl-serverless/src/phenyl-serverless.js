// @flow
import {
  assertValidRequestData,
} from 'phenyl-utils'

import {
  normalizeCustomHandlers,
} from './create-custom-execution-handlers'

import type {
  Id,
  RequestData,
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
      const { requestData, sessionId } = context
      return this.run(requestData, sessionId)
    }
  }

  /**
   *
   */
  async run(reqData: RequestData, sessionId: ?Id): Promise<Response> {
    const session = await this.sessionClient.get(sessionId)

    assertValidRequestData(reqData)

    const isAccessible = await this.aclHandler(reqData, session, this.client)
    if (!isAccessible) {
      throw new Error('Authorization Required.')
    }

    const isValid = await this.validationHandler(reqData, session, this.client)
    if (!isValid) {
      throw new Error('Params are not valid.')
    }

    if (reqData.find != null) {
      const result = await this.client.find(reqData.find)
      return { find: result }
    }
    if (reqData.findOne != null) {
      const result = await this.client.findOne(reqData.findOne)
      return { findOne: result }
    }
    if (reqData.get != null) {
      const result = await this.client.get(reqData.get)
      return { get: result }
    }
    if (reqData.getByIds != null) {
      const result = await this.client.getByIds(reqData.getByIds)
      return { getByIds: result }
    }
    if (reqData.insert != null) {
      const result = await this.client.insert(reqData.insert)
      return { insert: result }
    }
    if (reqData.insertAndGet != null) {
      const result = await this.client.insertAndGet(reqData.insertAndGet)
      return { insertAndGet: result }
    }
    if (reqData.insertAndFetch != null) {
      const result = await this.client.insertAndFetch(reqData.insertAndFetch)
      return { insertAndFetch: result }
    }
    if (reqData.update != null) {
      const result = await this.client.update(reqData.update)
      return { update: result }
    }
    if (reqData.updateAndGet != null) {
      const result = await this.client.updateAndGet(reqData.updateAndGet)
      return { updateAndGet: result }

    }
    if (reqData.updateAndFetch != null) {
      const result = await this.client.updateAndFetch(reqData.updateAndFetch)
      return { updateAndFetch: result }
    }
    if (reqData.delete != null) {
      const result = await this.client.delete(reqData.delete)
      return { delete: result }
    }

    if (reqData.runCustomQuery != null) {
      const result = await this.custom.queryHandler(reqData.runCustomQuery, session, this.client)
      return { runCustomQuery: result }
    }
    if (reqData.runCustomCommand != null) {
      const result = await this.custom.commandHandler(reqData.runCustomCommand, session, this.client)
      return { runCustomCommand: result }
    }

    throw new Error('Invalid request.')
  }
}
