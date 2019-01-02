// @flow

import type {
  ResponseData,
  EncodedHttpResponse,
} from 'phenyl-interfaces'

/**
 * Decode HTTP Response into ResponseData.
 * Only "body" field is used for decoding.
 */
export default function decodeResponse(encodedResponse: EncodedHttpResponse): ResponseData {
  const { body } = encodedResponse
  if (typeof body === 'string') {
    return JSON.parse(body)
  }
  return body
}
