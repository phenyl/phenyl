import { EncodedHttpResponse, ResponseData } from "@phenyl/interfaces";

import getStatusCode from "./get-status-code";

export default function encodeResponse(
  responseData: ResponseData
): EncodedHttpResponse {
  const json = JSON.stringify(responseData);
  return {
    body: json,
    headers: {
      "content-type": "application/json",
      "content-length": byteLength(json).toString()
    },
    statusCode: getStatusCode(responseData)
  };
}

function byteLength(str: string): number {
  return encodeURIComponent(str).replace(/%../g, "x").length;
}
