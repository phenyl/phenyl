// @flow

import type {
  ResponseData,
  EncodedHttpResponse,
} from 'phenyl-interfaces'

export default function encodeResponse(responseBody: string | EncodedHttpResponse): ResponseData {
  if (typeof responseBody === 'string') {
    return JSON.parse(responseBody).d
  }
  return responseBody.d
}
