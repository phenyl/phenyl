// @flow
import fp from 'fetch-ponyfill'
import {
  encodeRequest,
  decodeResponse,
} from 'phenyl-http-rules/jsnext'
import {
  PhenylCoreClient,
} from 'phenyl-utils/jsnext'
const { fetch } = fp()

import type {
  RequestData,
  ResponseData,
  HttpClientParams,
  ClientPathModifier,
  QueryStringParams,
} from 'phenyl-interfaces'

/**
 * Client to access to PhenylCore on server.
 *
 * (Query | Command) + sessionId => RequestData => [HttpServer] => ResponseData => (QueryResult | CommandResult | Error)
 *                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *                                             handleRequestData()
 * @see PhenylCoreClient in module 'phenyl-utils' for all interfaces.
 * Roughly, this implements CoreClient = (EntityClient, CustomClient and AuthClient).
 * EntityClient:
 *   find | findOne | get | getByIds
 *   insert | insertAndGet | insertAndGetMulti
 *   update | updateAndGet | updateAndFetch
 *   delete
 *
 * CustomClient:
 *   runCustomQuery | runCustomCommand
 *
 * AuthClient:
 *   login | logout
 */
export default class PhenylHttpClient extends PhenylCoreClient {
  /**
   * Base URL without "/api".
   *  No slash at the last.
   * e.g. https://example.com
   */
  url: string
  /**
   * (path: string) => string
   * Regular path to real server path.
   * The argument is real path string, start with "/api/".
   * e.g. (path) => `/path/to${path}`
   */
  modifyPath: ClientPathModifier

  constructor(params: HttpClientParams) {
    super()
    this.url = params.url
    this.modifyPath = params.modifyPath || (path => path)
  }

  /**
   * @override
   * Access to PhenylCore on server and get ResponseData.
   */
  async handleRequestData(reqData: RequestData): Promise<ResponseData> {
    const {
      method,
      headers,
      path,
      qsParams,
      body,
    } = encodeRequest(reqData)
    const qs = stringifyQsParams(qsParams)
    const url = `${this.url}${this.modifyPath(path)}${qs}`

    const response = await fetch(url, {
      method,
      headers,
      body,
    })

    const encodedResponse = {
      body: await response.json(),
      statusCode: response.status,
      headers: response.headers // FIXME: headers from polyfilled fetch don't implement Headers API.
    }

    return decodeResponse(encodedResponse)
  }
}

/**
 * @private
 * Stringify QsParams (key-value object)
 */
function stringifyQsParams(qsParams: ?QueryStringParams): string {
  if (qsParams == null) {
    return ''
  }

  return '?' + Object.keys(qsParams).map(name =>
    // $FlowIssue(object-keys-iteration)
    `${name}=${encodeURIComponent(qsParams[name])}`
  ).join('&')
}
