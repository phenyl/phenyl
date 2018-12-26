// @flow
import type { Id } from './id.js.flow'

export type HttpClientParams = {
  /**
   * Base URL without "/api".
   *  No slash at the last.
   * e.g. https://example.com
   */
  url: string,
  sessionId?: ?Id,
  modifyPath?: ClientPathModifier,
}

/**
 * (path: string) => string
 * Regular path to real server path.
 * The argument is real path string, start with "/api/".
 * e.g. (path) => `/path/to${path}`
 */
export type ClientPathModifier = (path: string) => string
