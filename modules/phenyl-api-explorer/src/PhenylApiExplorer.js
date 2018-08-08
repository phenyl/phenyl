/* eslint-env node */
// @flow
import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import type {
  FunctionalGroup,
  EncodedHttpResponse,
} from 'phenyl-interfaces'
import { shallowMap } from './utils'

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
    this.html = this.getClientHtml()
  }

  getClientHtml (): string {
    const templatePath = path.join(__dirname, 'client', 'build', 'index.html')
    const template = fs.readFileSync(templatePath, 'utf8')
    const data = {
      functionalGroup: {
        users: shallowMap(this.functionalGroup.users, ({ accountPropName, passwordPropName }) => {
          return { accountPropName, passwordPropName }
        }),
        nonUsers: shallowMap(this.functionalGroup.nonUsers, () => true),
        customQueries: shallowMap(this.functionalGroup.customQueries, () => true),
        customCommands: shallowMap(this.functionalGroup.customCommands, () => true),
      },
    }
    return ejs.render(template, data)
  }

  async handler (): Promise<EncodedHttpResponse> {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: this.html,
    }
  }
}
