// @flow
import fs from 'fs'
import path from 'path'
import ECT from 'ect'
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
  // functionalGroup: FunctionalGroup
  // path: string
  // handler: function

  constructor (functionalGroup: FunctionalGroup, params: ExplorerParams) {
    this.functionalGroup = functionalGroup
    this.path = params.path
    this.handler = this.handler.bind(this)
  }

  shallowMap (obj: Object, fn: (any, string, Object) => any): Object {
    const ret = {}
    for (let p in obj) {
      ret[p] = fn(obj[p], p, obj)
    }
    return ret
  }

  async handler (encodedHttpRequest: EncodedHttpRequest, restApiClient: RestApiClient): Promise<EncodedHttpResponse> {
    const renderer = ECT({ root : __dirname + '/client/build' })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: renderer.render(`index.html`, {
        functionalGroup: {
          users: this.shallowMap(this.functionalGroup.users, ({ accountPropName, passwordPropName }) => {
            return { accountPropName, passwordPropName }
          }),
          nonUsers: this.shallowMap(this.functionalGroup.nonUsers, () => true),
          customQueries: this.shallowMap(this.functionalGroup.customQueries, () => true),
          customCommands: this.shallowMap(this.functionalGroup.customCommands, () => true),
        },
      }),
    }
  }
}
