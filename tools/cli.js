// @flow
/* eslint-env node */
/* eslint-disable no-console */

import { join, dirname as dir } from 'path'
import { run as runCommand } from './lib/shell.js'
import chalk from 'chalk'
import fs from 'fs'
import PhenylModuleGraph from './lib/phenyl-module-graph.js'
import type { PackageJSONsByPath, BumpTypesByModuleName } from './lib/phenyl-module-graph.js'

const rootPath = dir(__dirname)

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
    this.graph = new PhenylModuleGraph(rootPath, rootPackageJson, packageJsonsByName)
  }

  clean() {
    for (const phenylModule of this.graph.phenylModules) {
      console.log(chalk.cyan(`\n[${phenylModule.name}] clean start.`))
      const shellCommand = phenylModule.cleanCommand()
      runCommand(shellCommand)
      console.log(chalk.green(`[${phenylModule.name}] ✓ clean done.`))
    }
  }

  test() {
    const failedModules = []

    for (const phenylModule of this.graph.phenylModules) {
      console.log(chalk.cyan(`\n[${phenylModule.name}] test start.`))

      if (phenylModule.hasTest) {
        const iter = phenylModule.testCommands(this.graph)
        let shellResult, iterResult = iter.next()
        while (!iterResult.done) {
          const shellCommand = iterResult.value
          shellResult = runCommand(shellCommand)
          iterResult = iter.next(shellResult)
        }
        const succeeded = iterResult.value
        if (!succeeded) { failedModules.push(phenylModule.name) }
      }
      else {
        console.log(`No test specified in "${phenylModule.name}".`)
      }
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
      console.log(chalk.cyan(`[${phenylModule.name}] start install.`))
      const iter = phenylModule.installCommands(this.graph)
      let shellResult, iterResult = iter.next()
      while (!iterResult.done) {
        const shellCommand = iterResult.value
        shellResult = runCommand(shellCommand)
        iterResult = iter.next(shellResult)
      }
      console.log(chalk.green(`[${phenylModule.name}] ✓ install done.\n`))
    }
  }

  build(...moduleNames: Array<string>) {
    const moduleNamesToBuild = moduleNames.length > 0 ? moduleNames : this.graph.moduleNames
    for (const moduleName of moduleNamesToBuild) {
      const phenylModule = this.graph.getModule(moduleName)
      const iter = phenylModule.buildCommands()
      let iterResult = iter.next()
      while (!iterResult.done) {
        const shellCommand = iterResult.value
        const shellResult = runCommand(shellCommand)
        iterResult = iter.next(shellResult)
      }
    }
  }

  bump(bumpTypesByModuleName: BumpTypesByModuleName) {
    const versions = this.graph.getBumpedVersions(bumpTypesByModuleName)
    for (const phenylModule of this.graph.phenylModules) {
      const change = phenylModule.bump(versions)
      if (change) {
        // $FlowIssue(dynamic-require-json)
        const packageJson = Object.assign(require(phenylModule.packageJsonPath), change)
        fs.writeFileSync(phenylModule.packageJsonPath, JSON.stringify(packageJson, null, 2))
      }
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

      console.log(chalk.cyan(`[${phenylModule.name}] start publishing.`))
      const iter = phenylModule.publishCommands(this.graph)
      let iterResult = iter.next()
      while (!iterResult.done) {
        const shellCommand = iterResult.value
        const shellResult = runCommand(shellCommand)
        iterResult = iter.next(shellResult)
      }
      console.log(chalk.green(`[${phenylModule.name}] ✓ publish done.\n`))
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
      cli.test()
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
