// @flow
import { join, relative as rel, dirname as dir, basename as base } from 'path'
import type {
  ShellResult,
  ShellCommand,
} from './shell.js'
import type PhenylModuleGraph, {
  Version,
  VersionsByModuleName,
} from './phenyl-module-graph.js'

export type PackageJSON = {
  name: string,
  main: string,
  version: Version,
  scripts: ?{ [scriptName: string]: string },
  dependencies: ?{ [moduleName: string]: Version },
  devDependencies: ?{ [moduleName: string]: Version },
}

type PhenylModuleParams = {
  name: string,
  modulePath: string,
  version: Version,
  scripts?: { [scriptName: string]: string },
  main: string,
  dependencies?: { [moduleName: string]: string },
  devDependencies?: { [moduleName: string]: string },
}

export default class PhenylModule {
  name: string
  modulePath: string
  version: Version
  scripts: { [scriptName: string]: string }
  main: string
  dependencies: { [moduleName: string]: string }
  devDependencies: { [moduleName: string]: string }

  /**
   * Factory of PhenylModule
   */
  static create(modulePath: string, packageJson: PackageJSON): PhenylModule {
    const scripts = packageJson.scripts || {}
    const dependencies = packageJson.dependencies || {}
    const devDependencies = packageJson.devDependencies || {}
    const main = packageJson.main || ''

    const params = {
      name: packageJson.name,
      modulePath,
      version: packageJson.version,
      scripts,
      main,
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
    this.main = params.main
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

  cleanCommand(): ShellCommand {
    return {
      type: 'rm',
      args: ['-rf',
        join(this.modulePath, 'node_modules'),
        join(this.modulePath, 'dist'),
        join(this.modulePath, 'package-lock.json'),
        join(this.modulePath, '.nyc_output'),
        join(this.modulePath, 'coverage'),
      ]
    }
  }

  cleanForReleaseCommand(): ShellCommand {
    return {
      type: 'rm',
      args: ['-rf',
        join(this.modulePath, 'dist'),
        join(this.modulePath, 'package-lock.json'),
      ]
    }
  }

  *buildCommands(graph: PhenylModuleGraph): Generator<ShellCommand, *, ShellResult> {
    if (this.scripts.build) {
      yield {
        type: 'cd',
        args: [this.modulePath]
      }
      yield {
        type: 'exec',
        args: ['npm run build']
      }
      yield {
        type: 'cd',
        args: [graph.rootPath]
      }
    } else {
      yield {
        type: 'exec',
        args: [`BABEL_ENV=build babel ${join(this.modulePath, 'src')} -d ${join(this.modulePath, 'dist')}`]
      }
      yield* this.createFlowDefinitionCommands()
    }
  }

  *createFlowDefinitionCommands(): Generator<ShellCommand, *, ShellResult> {
    if (!this.main) { return }
    const result = yield { type: 'test', args: ['-f', join(this.modulePath, 'jsnext.js')] }
    if (result.code !== 0) { return }

    yield { type: 'mkdir', args: ['-p', join(this.modulePath, dir(this.main))] }

    const { stdout } = yield {
      type: 'cat',
      args: [join(this.modulePath, 'jsnext.js')]
    }
    const content = stdout.split('./src').join('../src')
    const dist = join(this.modulePath, this.main) + '.flow'
    yield {
      type: 'save',
      args: [content, dist],
    }
  }


  *publishCommands(graph: PhenylModuleGraph): Generator<ShellCommand, *, ShellResult> {
    yield this.cleanForReleaseCommand()
    yield* this.buildCommands(graph)
    yield { type: 'cd', args: [this.modulePath] }
    yield { type: 'exec', args: ['npm publish'] }
    yield { type: 'cd', args: [graph.rootPath] }
  }

  /**
   * Returns whether test succeeded or not.
   */
  *testCommands(graph: PhenylModuleGraph): Generator<ShellCommand, boolean, ShellResult> {
    yield { type: 'cd', args: [this.modulePath] }
    const { code } = yield { type: 'exec', args: ['npm test --color always'] }
    yield { type: 'cd', args: [graph.rootPath] }
    return code === 0
  }

  *installCommands(graph: PhenylModuleGraph): Generator<ShellCommand, *, *> {
    const { rootPath } = graph
    const { modulePath } = this
    const nodeModulesPath = join(modulePath, 'node_modules')
    yield { type: 'mkdir', args: ['-p', nodeModulesPath] }
    yield { type: 'cd', args: [nodeModulesPath] }

    const dependings = this.getDependings(graph)
    for (const dependingModule of dependings) {
      yield { type: 'rm', args: ['-rf', join(nodeModulesPath, dependingModule.name)] }
      const relative = rel(nodeModulesPath, dependingModule.modulePath)
      yield { type: 'ln', args: ['-s', relative, dependingModule.name] }
    }
    yield { type: 'cd', args: [nodeModulesPath] }

    const rootNodeModulesPath = join(rootPath, 'node_modules')
    const commons = this.getCommons(graph)
    for (const commonModuleName of commons) {
      const commonModulePath = join(rootNodeModulesPath, commonModuleName)
      const relative = rel(nodeModulesPath, commonModulePath)
      yield { type: 'ln', args: ['-sf', relative, commonModuleName] }
    }
    yield { type: 'cd', args: [rootPath] }

    const binPath = join(nodeModulesPath, '.bin')
    const mochaPath = join(rootNodeModulesPath, '.bin', 'mocha')
    const nycPath = join(rootNodeModulesPath, '.bin', 'nyc')
    yield { type: 'mkdir', args: ['-p', binPath] }
    yield { type: 'cd', args: [binPath] }
    yield { type: 'ln', args: ['-sf', rel(binPath, mochaPath), 'mocha'] }
    yield { type: 'ln', args: ['-sf', rel(binPath, nycPath), 'nyc'] }
    yield { type: 'exec', args: ['npm install --color always --loglevel=error'] }
    yield { type: 'rm', args: ['-f', join(modulePath, 'package-lock.json')] }
    yield { type: 'cd', args: [rootPath] }
    yield* this.createFlowDefinitionCommands()
  }
}
