// @flow
import fs from 'fs'
import path from 'path'
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
    // FIXME: コンストラクタへ
    const explorer = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8')

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: explorer,
    }
  }
}
