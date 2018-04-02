// @flow
/* eslint-env node */
/* eslint-disable no-console */

import { fork } from 'child_process'
import { join, dirname as dir } from 'path'
import ChildExec, { type MethodName, type InterProcessMessage } from './child-exec.js'
import { run as runCommand } from './lib/shell.js'
import PhenylModule from './lib/phenyl-module.js'
import chalk from 'chalk'
import fs from 'fs'
import PhenylModuleGraph from './lib/phenyl-module-graph.js'
import type { PackageJSONsByPath, BumpTypesByModuleName } from './lib/phenyl-module-graph.js'

const rootPath = dir(dir(__dirname))

class CLI {
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

  constructor() {
    // $FlowIssue(dynamic-require-json)
    const rootPackageJson = require(join(rootPath, 'package.json'))
    const packageJsonsByName = Object.assign(
      this.constructor.loadPackageJsons(join(rootPath, 'modules')),
      this.constructor.loadPackageJsons(join(rootPath, 'examples'))
    )
    this.graph = PhenylModuleGraph.create(rootPath, rootPackageJson, packageJsonsByName)
  }

  execChild(phenylModule: PhenylModule, methodName: MethodName, params?: Object) {
    const send = this.onReceiveMessage.bind(this)
    const child = new ChildExec({ moduleName: phenylModule.name, graph: this.graph }, send)
    child.run(methodName, params)
  }

  async execChildByFork(phenylModule: PhenylModule, methodName: MethodName, params?: Object) {
    const childPath = join(__dirname, 'child-exec.js')
    const cp = fork(childPath)
    cp.on('message', this.onReceiveMessage.bind(this))
    cp.send({ moduleName: phenylModule.name, graph: this.graph, methodName, params })
    return new Promise(resolve => {
      cp.on('exit', resolve)
    })
  }

  onReceiveMessage(message: InterProcessMessage) {
    switch (message.type) {
      case 'message': {
        const { color, text } = message.payload
        console.log(color ? chalk[color](text) : text)
        break
      }
      case 'result': {
        console.log({ succeeded: message.payload.succeeded })
        break
      }
      default: {
        console.error(message)
        throw new Error('Unknown message')
      }
    }
  }

  clean() {
    for (const phenylModule of this.graph.phenylModules) {
      this.execChildByFork(phenylModule, 'clean')
    }
  }

  test(...moduleNames: Array<string>) {
    const failedModules = []
    const moduleNamesToTest = moduleNames.length > 0 ? moduleNames : this.graph.moduleNames
    for (const moduleName of moduleNamesToTest) {
      const phenylModule = this.graph.getModule(moduleName)
      this.execChildByFork(phenylModule, 'test')
    }

    console.log(
      chalk.cyan('-------------------\n') +
      chalk.cyan('test summary\n') +
      chalk.cyan('-------------------')
    )

    if (failedModules.length > 0) {
      console.log(
        chalk.red('☓ Tests failed in The following modules\n') +
        '\n' +
        failedModules.join('\n')
      )
      process.exit(1)
    } else {
      console.log(chalk.green('✓ Tests passed in all modules!'))
    }
  }

  load() {
    for (const phenylModule of this.graph.phenylModules) {
      this.execChildByFork(phenylModule, 'load')
    }
  }

  build(...moduleNames: Array<string>) {
    const moduleNamesToBuild = moduleNames.length > 0 ? moduleNames : this.graph.moduleNames
    for (const moduleName of moduleNamesToBuild) {
      const phenylModule = this.graph.getModule(moduleName)
      this.execChildByFork(phenylModule, 'build')
    }
  }

  bump(bumpTypesByModuleName: BumpTypesByModuleName) {
    const versions = this.graph.getBumpedVersions(bumpTypesByModuleName)
    for (const phenylModule of this.graph.phenylModules) {
      this.execChild(phenylModule, 'bump', bumpTypesByModuleName)
    }
    const versionsForPrint = Object.keys(versions).map(name => `\t${name}: ${versions[name]}`).join('\n')
    console.log(`git commit -am "update versions: \n${versionsForPrint}"`)

    const modulesToPublish = this.graph.phenylModules
      .filter(phenylModule => phenylModule.isLib && versions[phenylModule.name])
      .map(phenylModule => phenylModule.name)

    console.log(`npm run publish -- ${modulesToPublish.join(' ')}"`)
  }

  publish(...moduleNames: Array<string>) {
    const { stdout } = runCommand({ type: 'exec', args: ['npm whoami'] })
    if (stdout.trim() !== 'phenyl') {
      console.error('npm user must be "phenyl" to publish. Check your .npmrc')
      return
    }

    for (const phenylModule of this.graph.phenylModules) {
      if (!moduleNames.includes(phenylModule.name)) { continue }
      this.execChild(phenylModule, 'publish')
    }
  }
}

function main(argv) {
  const cli = new CLI()
  const [ subcommand ] = argv
  switch(subcommand) {
    case 'build': {
      const moduleNames = argv.slice(1)
      cli.build(...moduleNames)
      break
    }
    case 'load': {
      cli.load()
      break
    }
    case 'test': {
      const moduleNames = argv.slice(1)
      cli.test(...moduleNames)
      break
    }
    case 'clean': {
      cli.clean()
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
      const moduleNames = argv.slice(1)
      cli.publish(...moduleNames)
      break
    }
    default: {
      throw new Error(`unknown subcommand: ${subcommand}`)
    }
  }
}

main(process.argv.slice(2))
