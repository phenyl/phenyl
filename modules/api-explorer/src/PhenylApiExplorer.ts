import fs from "fs";
import path from "path";
import ejs from "ejs";
import { FunctionalGroup, EncodedHttpResponse } from "@phenyl/interfaces";
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

  async handler(): Promise<EncodedHttpResponse> {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html"
      },
      body: this.html
    };
  }
}
