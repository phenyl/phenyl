// @flow
import { join, relative as rel, dirname as dir, basename as base } from 'path'

import type PhenylModuleGraph, {
  Version,
  VersionsByModuleName,
} from './phenyl-module-graph.js'

export type PackageJSON = {
  name: string,
  version: Version,
  scripts: ?{ [scriptName: string]: string },
  dependencies: ?{ [moduleName: string]: Version },
  devDependencies: ?{ [moduleName: string]: Version },
}

export type ShellCommandType = 'cd' | 'mkdir' | 'exec' | 'ln' | 'rm'

export type ShellCommand = {
  command: ShellCommandType,
  args: Array<string>
}

export type ShellResult = {
  code: number,
  stdout: string,
  stderr: string,
}

type PhenylModuleParams = {
  name: string,
  modulePath: string,
  version: Version,
  scripts?: { [scriptName: string]: string },
  dependencies?: { [moduleName: string]: string },
  devDependencies?: { [moduleName: string]: string },
}

export default class PhenylModule {
  name: string
  modulePath: string
  version: Version
  scripts: { [scriptName: string]: string }
  dependencies: { [moduleName: string]: string }
  devDependencies: { [moduleName: string]: string }

  /**
   * Factory of PhenylModule
   */
  static create(modulePath: string, packageJson: PackageJSON): PhenylModule {
    const scripts = packageJson.scripts || {}
    const dependencies = packageJson.dependencies || {}
    const devDependencies = packageJson.devDependencies || {}

    const params = {
      name: packageJson.name,
      modulePath,
      version: packageJson.version,
      scripts,
      dependencies,
      devDependencies,
    }
    return new PhenylModule(params)
  }

  constructor(params: PhenylModuleParams) {
    this.name = params.name
    this.modulePath = params.modulePath
    this.version = params.version
    this.scripts = params.scripts || {}
    this.dependencies = params.dependencies || {}
    this.devDependencies = params.devDependencies || {}
  }

  get hasTest(): boolean {
    return Object.keys(this.scripts).includes('test')
  }

  get isExample(): boolean {
    return base(dir(this.modulePath)) === 'examples'
  }

  get isLib(): boolean {
    return base(dir(this.modulePath)) === 'modules'
  }

  get allDependencies(): Array<string> {
    return [].concat(
      Object.keys(this.dependencies),
      Object.keys(this.devDependencies),
    )
  }

  get packageJsonPath(): string {
    return join(this.modulePath, 'package.json')
  }

  bump(versions: VersionsByModuleName): ?$Shape<PackageJSON> {
    const changed = {}
    Object.keys(versions).forEach(name => {
      if (this.name === name) {
        changed.version = versions[name]
      }
      else if (this.dependencies[name]) {
        changed.dependencies = Object.assign({},
          this.dependencies,
          changed.dependencies,
          { [name]: `~${versions[name]}`}
        )
      }
      else if (this.devDependencies[name]) {
        changed.devDependencies = Object.assign({},
          this.devDependencies,
          changed.devDependencies,
          { [name]: `~${versions[name]}`}
        )
      }
    })
    return Object.keys(changed).length > 0 ? changed : null
  }

  hasDependencies(...moduleNames: Array<string>): boolean {
    return moduleNames.some(moduleName =>
      this.dependencies[moduleName] || this.devDependencies[moduleName]
    )
  }

  getDependings(graph: PhenylModuleGraph): Array<PhenylModule> {
    return graph.phenylModules.filter(phenylModule =>
      this.dependencies[phenylModule.name] || this.devDependencies[phenylModule.name]
    )
  }

  getCommons(graph: PhenylModuleGraph): Array<string> {
    return graph.commonModuleNames.filter(commonModuleName =>
      this.dependencies[commonModuleName] || this.devDependencies[commonModuleName]
    )
  }

  clearCommand(): ShellCommand {
    return {
      command: 'rm',
      args: ['-rf',
        join(this.modulePath, 'node_modules'),
        join(this.modulePath, 'dist'),
        join(this.modulePath, 'package-lock.json'),
      ]
    }
  }

  buildCommand(): ShellCommand {
    return {
      command: 'exec',
      args: [`BABEL_ENV=build babel ${join(this.modulePath, 'src')} -d ${join(this.modulePath, 'dist')}`]
    }
  }

  /**
   * Returns whether test succeeded or not.
   */
  *testCommands(graph: PhenylModuleGraph): Generator<ShellCommand, boolean, ShellResult> {
    yield { command: 'cd', args: [this.modulePath] }
    const { code } = yield { command: 'exec', args: ['npm test --color always'] }
    yield { command: 'cd', args: [graph.rootPath] }
    return code === 0
  }

  *installCommands(graph: PhenylModuleGraph): Generator<ShellCommand, *, *> {
    const { rootPath } = graph
    const { modulePath } = this
    const nodeModulesPath = join(modulePath, 'node_modules')
    yield { command: 'mkdir', args: ['-p', nodeModulesPath] }
    yield { command: 'cd', args: [nodeModulesPath] }

    const dependings = this.getDependings(graph)
    for (const dependingModule of dependings) {
      const relative = rel(nodeModulesPath, dependingModule.modulePath)
      yield { command: 'ln', args: ['-sf', relative, dependingModule.name] }
    }
    yield { command: 'cd', args: [nodeModulesPath] }

    const rootNodeModulesPath = join(rootPath, 'node_modules')
    const commons = this.getCommons(graph)
    for (const commonModuleName of commons) {
      const commonModulePath = join(rootNodeModulesPath, commonModuleName)
      const relative = rel(nodeModulesPath, commonModulePath)
      yield { command: 'ln', args: ['-sf', relative, commonModuleName] }
    }
    yield { command: 'cd', args: [rootPath] }

    const binPath = join(nodeModulesPath, '.bin')
    const kochaPath = join(rootNodeModulesPath, '.bin', 'kocha')
    yield { command: 'mkdir', args: ['-p', binPath] }
    yield { command: 'cd', args: [binPath] }
    yield { command: 'ln', args: ['-sf', rel(binPath, kochaPath), 'kocha'] }
    yield { command: 'exec', args: ['npm install --color always --loglevel=error'] }
    yield { command: 'rm', args: ['-f', join(modulePath, 'package-lock.json')] }
    yield { command: 'cd', args: [rootPath] }
  }
}
