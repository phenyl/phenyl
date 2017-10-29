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

  test() {
    let passed = false
    let skipped = false

    const pathToModuleFromRoot = `modules/${this.name}`
    shell.cd(pathToModuleFromRoot)
    const { scripts } = this

    if (scripts && Object.keys(scripts).includes('test')) {
      passed = (shell.exec('npm test --color always').code === 0)
    }
    else {
      skipped = true
      shell.echo(`no test specified in ${this.name}`)
    }
    shell.cd(`../../`)
    return { passed, skipped }
  }

  build() {
    shell.exec(`BABEL_ENV=build babel modules/${this.name}/src -d modules/${this.name}/dist`)
  }
}
