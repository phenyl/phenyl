// @flow
import http from 'http' // = NODE ONLY
import https from 'https' // = NODE ONLY

import {
  decodeRequest,
  encodeResponse,
  getStatusCode,
} from 'phenyl-http-rules/jsnext'

import {
  createErrorResult,
} from 'phenyl-utils'


import type {
  RequestData,
  ResponseData,
} from 'phenyl-interfaces'

export default class PhenylServer {
  constructor() {
  }

  listen() {
  }

  /**
   * @private
   */
  async onRequest() {
  }
}
