// @flow
/*eslint-env node*/
import getRawBody from 'raw-body'
import {
  decodeRequest,
  getStatusCode,
  ServerLogic,
} from 'phenyl-http-rules'
import { createServerError } from 'phenyl-utils'

import type {
  ServerParams,
  RestApiHandler,
  EncodedHttpRequest,
  TypeMap,
} from 'phenyl-interfaces'
import type { $Request, $Response, NextFunction } from 'express'


export class PhenylExpressMiddlewareCreator<TM: TypeMap> {
  /**
   * Create an Express Middleware to listen to Phenyl API requests.
   * By default, paths start with "/api" will be handled by restApiHandler.
   */
  static createPhenylApiMiddleware(restApiHandler: RestApiHandler, pathRegex: RegExp = /^\/api\/.*$/) {
    return async (req: $Request, res: $Response, next: NextFunction) => {
      const { path, method, query, headers } = req
      if (!pathRegex.test(path)) {
        return next()
      }
      // $FlowIssue(compatible)
      const encodedHttpRequest: EncodedHttpRequest = {
        method,
        headers,
        path,
        qsParams: query,
        body: await getRawBody(req, true),
      }
      let responseData
      try {
        const requestData = decodeRequest(encodedHttpRequest)
        responseData = await restApiHandler.handleRequestData(requestData)
      } catch (err) {
        responseData = { type: 'error', payload: createServerError(err) }
      }
      res.status(getStatusCode(responseData)).json(responseData)
    }
  }

  /**
   * Express Middleware to redirect requests to Phenyl Server.
   * By default, "/api/*" and "/explorer" will be redirected to serverLogic.
   * (/explorer is reserved for phenyl-explorer.)
   */
  static createPhenylMiddleware(serverParams: ServerParams<TM>, pathRegex: RegExp = /^\/api\/.*$|^\/explorer($|\/.*$)/) {
    return async (req: $Request, res: $Response, next: NextFunction) => {
      const { path, method, query, headers } = req
      if (!pathRegex.test(path)) {
        return next()
      }
      const serverLogic = new ServerLogic(serverParams)
      // $FlowIssue(compatible)
      const encodedHttpRequest: EncodedHttpRequest = {
        method,
        headers,
        path,
        qsParams: query,
        body: await getRawBody(req, true),
      }
      const response = await serverLogic.handleRequest(encodedHttpRequest)
      res
        .status(response.statusCode)
        .header(response.headers)
        .send(response.body)
    }
  }
}

const PEMC: Class<PhenylExpressMiddlewareCreator<*>> = PhenylExpressMiddlewareCreator
export const {
  createPhenylApiMiddleware,
  createPhenylMiddleware,
} = PEMC
