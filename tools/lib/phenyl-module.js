// @flow
import type {
  Version,
} from './phenyl-module-graph.js'

type PhenylModuleParams = {
  name: string,
  dirname: string,
  modulesPath: string,
  version: Version,
  scripts: ?{ [scriptName: string]: string },
  dependingModuleNames: Array<string>,
  dependedModuleNames: Array<string>,
  commonModuleNames: Array<string>,
}


export default class PhenylModule {
  name: string
  dirname: string
  modulesPath: string
  version: Version
  scripts: { [scriptName: string]: string }
  dependingModuleNames: Array<string>
  dependedModuleNames: Array<string>
  commonModuleNames: Array<string>

  constructor(params: PhenylModuleParams) {
    this.name = params.name
    this.dirname = params.dirname
    this.modulesPath = params.modulesPath
    this.version = params.version
    this.scripts = params.scripts || {}
    this.dependingModuleNames = params.dependingModuleNames
    this.dependedModuleNames = params.dependedModuleNames
    this.commonModuleNames = params.commonModuleNames
  }

  get modulePath(): string {
    return `${this.modulesPath}/${this.dirname}`
  }
}
