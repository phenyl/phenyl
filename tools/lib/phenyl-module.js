// @flow
const shell = require('shelljs')

import type {
  Version,
  PackageJSON,
} from './phenyl-module-graph.js'

type PhenylModuleParams = {
  name: string,
  version: Version,
  scripts: ?{ [scriptName: string]: string },
  dependingModuleNames: Array<string>,
  dependedModuleNames: Array<string>,
}


export default class PhenylModule {
  name: string
  version: Version
  scripts: { [scriptName: string]: string }
  dependingModuleNames: Array<string>
  dependedModuleNames: Array<string>

  constructor(params: PhenylModuleParams) {
    this.name = params.name
    this.version = params.version
    this.scripts = params.scripts || {}
    this.dependingModuleNames = params.dependingModuleNames
    this.dependedModuleNames = params.dependedModuleNames
  }
}
