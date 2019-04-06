import url from "url";
import { ServerLogic } from "@phenyl/http-rules";
import http, { IncomingMessage, ServerResponse } from "http";
import {
  EncodedHttpResponse,
  HttpMethod,
  ServerParams,
  GeneralTypeMap,
  QueryStringParams
} from "@phenyl/interfaces";
import https from "https";

/**
 * HTTP(s) server wrapping ServerLogic (implemented at "phenyl-http-rules") and Node.js server.
 */

export default class PhenylHttpServer<TM extends GeneralTypeMap> {
  /**
   * Instance of the result: require('http').createServer()
   */
  server: http.Server | https.Server;
  /**
   * Universal server logic.
   * Offers the flow: EncodedHttpRequest => EncodedHttpResponse
   */

  logic: ServerLogic<TM>;

  constructor(server: http.Server | https.Server, params: ServerParams<TM>) {
    this.server = server;
    this.logic = new ServerLogic(params);
  }
  /**
   * @public
   * Listen the given port to launch http server.
   */

  listen(
    port: number,
    hostname?: string,
    backlog?: number,
    callback?: Function
  ) {
    this.server.on("request", this.handleIncomingMessage.bind(this));
    this.server.listen(port, hostname, backlog, callback);
  }
  /**
   * @public
   * Stops the server from accepting new connections.
   */

  close() {
    this.server.close();
  }
  /**
   * @private
   * Concatenate request body from chunks.
   */

  private getRequestBody(request: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      const read = () => {
        try {
          // https://nodejs.org/api/stream.html#stream_readable_read_size
          const chunks: Array<Buffer> = [];
          let chunk;
          let totalLength = 0;

          while (null !== (chunk = request.read())) {
            chunks.push(chunk);

            totalLength += chunk.length;
          }

          resolve(Buffer.concat(chunks, totalLength).toString("utf8"));
        } catch (err) {
          reject(err);
        }
      };

      request.once("error", err => {
        request.removeListener("readable", read);
        reject(err);
      });
      request.once("readable", read);
    });
  }

  /**
   * @private
   * Handle one IncomingMessage.
   *
   * 1. Prepare EncodedHttpRequest.
   * 2. Invoke ServerLogic.
   * 3. Response to client via ServerResponse object.
   */
  async handleIncomingMessage(
    request: IncomingMessage,
    response: ServerResponse
  ) {
    let path = "";
    let qsParams: QueryStringParams = {};

    if (request.url) {
      const requestUrl = url.parse(request.url, true);
      path = requestUrl.pathname || "";
      qsParams = requestUrl.query as QueryStringParams;
    }

    const encodedHttpRequest = {
      method: request.method as HttpMethod,
      path,
      body: await this.getRequestBody(request),
      headers: request.headers,
      qsParams
    };
    const encodedResponse = await this.logic.handleRequest(encodedHttpRequest);
    respond(response, encodedResponse);
  }
}
/**
 * @private
 * Response with Node.js's ServerResponse object.
 * TODO: Buffer type will be allowed in encodedResponse.body.
 */
function respond(
  response: ServerResponse,
  encodedResponse: EncodedHttpResponse
) {
  let { body, statusCode, headers } = encodedResponse;
  response.writeHead(statusCode, headers as http.OutgoingHttpHeaders);

  if (typeof body !== "string") {
    body = JSON.stringify(body);
  }

  response.write(body);
  response.end();
}
