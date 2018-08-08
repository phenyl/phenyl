// @flow
/* eslint-env node */
/* eslint-disable no-console */

import { fork } from 'child_process'
import { join, dirname as dir } from 'path'
import ChildExec, { type MethodName, type InterProcessMessage, type ExecParams } from './child-exec.js'
import { run as runCommand } from './lib/shell.js'
import PhenylModule from './lib/phenyl-module.js'
import chalk from 'chalk'
import fs from 'fs'
import PhenylModuleGraph from './lib/phenyl-module-graph.js'
import type { PackageJSONsByPath, BumpTypesByModuleName } from './lib/phenyl-module-graph.js'

type ExecOptions = {
  parallel?: boolean,
  params?: ExecParams,
}

type ChildExecResult = boolean

const rootPath = dir(dir(__dirname))

class CLI {
  parallel: boolean
  graph: PhenylModuleGraph

  static loadPackageJsons(path: string): PackageJSONsByPath {
    return fs.readdirSync(path)
      .filter(moduleName => fs.statSync(join(path, moduleName)).isDirectory())
      .reduce((acc, moduleName) => {
        const modulePath = join(path, moduleName)
        // $FlowIssue(dynamic-require-json)
        acc[modulePath] = require(join(modulePath, 'package.json'))
        return acc
      }, {})
  }

  constructor(parallel: boolean) {
    // $FlowIssue(dynamic-require-json)
    const rootPackageJson = require(join(rootPath, 'package.json'))
    const packageJsonsByName = Object.assign(
      this.constructor.loadPackageJsons(join(rootPath, 'modules')),
      this.constructor.loadPackageJsons(join(rootPath, 'examples'))
    )
    this.parallel = parallel
    this.graph = PhenylModuleGraph.create(rootPath, rootPackageJson, packageJsonsByName)
  }

  get allModuleNames(): Array<string> {
    return this.graph.moduleNames
  }

  async clean(...moduleNames: Array<string>) {
    await this.execChildren(moduleNames, 'clean', { parallel: this.parallel })
    return 0
  }

  async test(...moduleNames: Array<string>) {
    const results = await this.execChildren(moduleNames, 'test', { parallel: this.parallel })
    const failedModules = Object.keys(results)
      .filter(succeeded => !succeeded)
    console.log(chalk.cyan(['-------------------', 'Test Summary', '-------------------'].join('\n')))
    if (failedModules.length > 0) {
      console.log(chalk.red('☓ Tests failed in The following modules\n\n') + failedModules.join('\n'))
      return 1
    }
    console.log(chalk.green('✓ Tests passed in all modules!'))
    return 0
  }

  async load(...moduleNames: Array<string>) {
    await this.execChildren(moduleNames, 'load', { parallel: this.parallel })
    return 0
  }

  async build(...moduleNames: Array<string>) {
    await this.execChildren(moduleNames, 'build', { parallel: this.parallel })
    return 0
  }

  async bump(bumpTypesByModuleName: BumpTypesByModuleName) {
    const versions = this.graph.getBumpedVersions(bumpTypesByModuleName)
    await this.execChildren(this.allModuleNames, 'bump', { parallel: this.parallel, params: { bumpTypesByModuleName } })
    const versionsForPrint = Object.keys(versions).map(name => `\t${name}: ${versions[name]}`).join('\n')
    console.log(`git commit -am "update versions: \n${versionsForPrint}"`)

    const modulesToPublish = this.graph.phenylModules
      .filter(phenylModule => phenylModule.isLib && versions[phenylModule.name])
      .map(phenylModule => phenylModule.name)

    console.log(`npm run publish -- ${modulesToPublish.join(' ')}"`)
  }

  async publish(...moduleNames: Array<string>) {
    const { stdout } = runCommand({ type: 'exec', args: ['npm whoami'] })
    if (stdout.trim() !== 'phenyl') {
      console.error('npm user must be "phenyl" to publish. Check your .npmrc')
      return
    }
    await this.execChildren(moduleNames, 'publish', { parallel: this.parallel })
    return 0
  }

  async execChildren(moduleNames: Array<string>, methodName: MethodName, options: ExecOptions): Promise<{ [string]: ChildExecResult }> {
    console.time(`Total Execution Time(method=${methodName}): `)
    console.log(`Run in ${options.parallel ? 'parallel' : 'order' }`)
    const names = moduleNames.length > 0 ? this.allModuleNames.filter(name => moduleNames.includes(name)): this.allModuleNames
    const results = await Promise.all(names.map(moduleName => this.execChild(this.graph.getModule(moduleName), methodName, options)))
    console.timeEnd(`Total Execution Time(method=${methodName}): `)
    return results.reduce((acc, result, i) => {
      const moduleName = names[i]
      return Object.assign(acc, { [moduleName]: result })
    }, {})
  }

  async execChild(phenylModule: PhenylModule, methodName: MethodName, options: ExecOptions): Promise<ChildExecResult> {
    const { parallel, params } = options
    if (parallel) {
      return this.execChildByFork(phenylModule, methodName, params)
    }
    return this.execChildInTheSameProcess(phenylModule, methodName, params)
  }

  execChildInTheSameProcess(phenylModule: PhenylModule, methodName: MethodName, params: ?ExecParams): ChildExecResult {
    const send = this.onReceiveMessage.bind(this)
    const child = new ChildExec({ moduleName: phenylModule.name, graph: this.graph }, send)
    const status = child.run(methodName, params)
    return status === 0
  }

  async execChildByFork(phenylModule: PhenylModule, methodName: MethodName, params: ?ExecParams): Promise<ChildExecResult> {
    const childPath = join(__dirname, 'child-exec.js')
    const cp = fork(childPath)
    cp.on('message', this.onReceiveMessage.bind(this))
    cp.send({ moduleName: phenylModule.name, graph: this.graph, methodName, params })
    return new Promise(resolve => {
      cp.on('exit', (status: number) => {
        resolve(status === 0)
      })
    })
  }

  onReceiveMessage(message: InterProcessMessage) {
    switch (message.type) {
      case 'message': {
        const { color, text } = message.payload
        // $FlowIssue(chalk[color])
        console.log(color ? chalk[color](text) : text)
        break
      }
      default: {
        console.error(message)
        throw new Error('Unknown message')
      }
    }
  }
}

function main(argv) {
  const parallel = (['parallel', 'p'].includes(argv[argv.length - 1]))
  if (parallel) argv.pop()
  const cli = new CLI(parallel)
  const [ subcommand ] = argv
  const moduleNames = argv.slice(1)
  switch(subcommand) {
    case 'build': {
      cli.build(...moduleNames)
      break
    }
    case 'load': {
      cli.load(...moduleNames)
      break
    }
    case 'test': {
      cli.test(...moduleNames)
      break
    }
    case 'clean': {
      cli.clean(...moduleNames)
      break
    }
    case 'bump': {
      const bumpTypesByModuleName = argv.slice(1)
        .map(moduleNameBump => moduleNameBump.split(':'))
        .reduce((acc, [modName, bumpType]) => {
          acc[modName] = bumpType || 'patch'
          return acc
        }, {})
      cli.bump(bumpTypesByModuleName)
      break
    }
    case 'publish': {
      cli.publish(...moduleNames)
      break
    }
    default: {
      throw new Error(`unknown subcommand: ${subcommand}`)
    }
  }
}

main(process.argv.slice(2))
