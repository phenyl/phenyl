// @flow

import type {
  ResponseData,
  EncodedHttpResponse,
} from 'phenyl-interfaces'

export default function encodeResponse(responseData: ResponseData): EncodedHttpResponse {
  return { d: responseData }
}
