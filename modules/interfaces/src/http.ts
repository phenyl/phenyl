/* global Headers */
import { GeneralResponseData } from "./response-data";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type QueryStringParams = { [name: string]: string };

export type EncodedHttpRequest = {
  method: HttpMethod;
  headers: {
    [header: string]: string | string[] | undefined;
  };
  path: string; // must start with "/"
  qsParams?: QueryStringParams;
  body?: string;
  parsedBody?: Object;
};

export type EncodedHttpResponse = {
  headers: { [name: string]: string } | Headers;
  body: string | GeneralResponseData; // stringified JSON or parsed JSON
  statusCode: number;
};
