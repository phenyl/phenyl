import fs from "fs";
import path from "path";
import ejs from "ejs";
import fileType from "file-type";
import {
  FunctionalGroup,
  EncodedHttpResponse,
  EncodedHttpRequest
} from "@phenyl/interfaces";
import { shallowMap, pkgDir } from "./utils";

export type ExplorerParams = {
  path: string;
  phenylApiUrlBase?: string;
};
export default class PhenylApiExplorer {
  functionalGroup: FunctionalGroup;
  path: string;
  phenylApiUrlBase: string;
  html: string;

  constructor(functionalGroup: FunctionalGroup, params: ExplorerParams) {
    this.functionalGroup = functionalGroup;
    this.path = params.path;
    this.phenylApiUrlBase = params.phenylApiUrlBase || "";
    this.handler = this.handler.bind(this);
    this.html = this.getClientHtml();
  }

  getClientHtml(): string {
    const templatePath = path.join(
      pkgDir("@phenyl/api-explorer-client"),
      "build",
      "index.html"
    );
    const template = fs.readFileSync(templatePath, "utf8");
    const data = {
      phenylApiUrlBase: this.phenylApiUrlBase,
      functionalGroup: {
        users: shallowMap(
          this.functionalGroup.users,
          ({ accountPropName, passwordPropName }) => {
            if (!accountPropName || !passwordPropName) {
              throw new Error(
                "accountPropName and passwordPropName are required"
              );
            }

            return {
              accountPropName,
              passwordPropName
            };
          }
        ),
        nonUsers: shallowMap(this.functionalGroup.nonUsers, () => true),
        customQueries: shallowMap(
          this.functionalGroup.customQueries,
          () => true
        ),
        customCommands: shallowMap(
          this.functionalGroup.customCommands,
          () => true
        )
      }
    };
    return ejs.render(template, data);
  }

  async handler(req: EncodedHttpRequest): Promise<EncodedHttpResponse> {
    const { path: requestPath } = req;

    const indexRegExp = new RegExp(`^${this.path}(/index(.html)?)?$`);
    if (indexRegExp.test(requestPath)) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "text/html"
        },
        body: this.html
      };
    } else {
      const clientSourcePath = path.join(
        pkgDir("@phenyl/api-explorer-client"),
        "build",
        requestPath
      );
      const sourceBuffer = fs.readFileSync(clientSourcePath);
      const sourceFileType = fileType(sourceBuffer)!;
      let sourceContentType = "text/plain";
      if (sourceFileType) {
        sourceContentType = sourceFileType.mime;
      } else if (/.*\.css$/.test(requestPath)) {
        sourceContentType = "text/css";
      } else if (/.*\.js$/.test(requestPath)) {
        sourceContentType = "application/javascript";
      } else if (/.*\.json$/.test(requestPath)) {
        sourceContentType = "application/manifest+json";
      }
      const body = sourceBuffer.toString();

      return {
        statusCode: 200,
        headers: {
          "Content-Type": sourceContentType
        },
        body
      };
    }
  }
}
