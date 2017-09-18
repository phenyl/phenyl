// @flow
import type {
  Id,
  RequestData,
  ResponseData,
  PhenylClient,
  Session,
  AclHandler,
  ValidationHandler,
  SessionClient,
  CustomQueryHandler,
  CustomCommandHandler,
} from 'phenyl-interfaces'

import type {
  LambdaEvent,
  LambdaContext,
  LambdaCallback,
  LambdaHandler,
} from '../decls/lambda.js.flow'

interface Runnable {
  async run(reqData: RequestData, sessionId: ?Id): Promise<ResponseData>
}

export const createLambdaHandler = (phenylCore: Runnable): LambdaHandler => {
  return async (event: LambdaEvent, context: LambdaContext, cb: LambdaCallback): Promise<void> => {
    try {
      const { requestData, sessionId } = extractRequestData()
      const responseData = await phenylCore.run(requestData, sessionId)
      cb(null, responseData)
    }
    catch (e) {
      cb(e)
    }
  }
}
