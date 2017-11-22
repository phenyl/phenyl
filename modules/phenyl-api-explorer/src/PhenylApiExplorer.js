// @flow
import fs from 'fs'
import path from 'path'
import ECT from 'ect'
import type { FunctionalGroup } from 'phenyl-interfaces'

export type ExplorerParams = {|
  path: string,
|}

export default class PhenylApiExplorer {
  constructor (functionalGroup: FunctionalGroup, params: ExplorerParams) {
    this.functionalGroup = functionalGroup
    this.path = params.path

    this.handler = this.handler.bind(this)
  }

  async handler (encodedHttpRequest: EncodedHttpRequest, restApiClient: RestApiClient): Promise<EncodedHttpResponse> {
    const renderer = ECT({ root : __dirname + '/client/build' })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: renderer.render(`index.html`, {
        functionalGroup: this.functionalGroup,
      }),
    }
  }
}
