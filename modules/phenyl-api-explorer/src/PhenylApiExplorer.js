// @flow
import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import type {
  FunctionalGroup,
  EncodedHttpRequest,
  RestApiClient,
  EncodedHttpResponse,
} from 'phenyl-interfaces'

export type ExplorerParams = {|
  path: string,
|}

export default class PhenylApiExplorer {
  functionalGroup: FunctionalGroup;
  path: string;
  handler: any;
  html: string;

  constructor (functionalGroup: FunctionalGroup, params: ExplorerParams) {
    this.functionalGroup = functionalGroup
    this.path = params.path
    this.handler = this.handler.bind(this)
    this.html = this.getClientHTML()
  }

  shallowMap (obj: Object, fn: (any, string, Object) => any): Object {
    const ret = {}
    for (let p in obj) {
      ret[p] = fn(obj[p], p, obj)
    }
    return ret
  }

  getClientHTML (): string {
    const templatePath = path.join(__dirname, 'client', 'build', 'index.html')
    const template = fs.readFileSync(templatePath, 'utf8')
    const data = {
      functionalGroup: {
        users: this.shallowMap(this.functionalGroup.users, ({ accountPropName, passwordPropName }) => {
          return { accountPropName, passwordPropName }
        }),
        nonUsers: this.shallowMap(this.functionalGroup.nonUsers, () => true),
        customQueries: this.shallowMap(this.functionalGroup.customQueries, () => true),
        customCommands: this.shallowMap(this.functionalGroup.customCommands, () => true),
      },
    }
    return ejs.render(template, data)
  }

  async handler (
    encodedHttpRequest: EncodedHttpRequest,
    restApiClient: RestApiClient
  ): Promise<EncodedHttpResponse> {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: this.html,
    }
  }
}
