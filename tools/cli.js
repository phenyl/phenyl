/* eslint-env node */
/* eslint-disable no-console */

import pth from 'path'
import shell from 'shelljs'
import chalk from 'chalk'
import fs from 'fs'
import PhenylModuleGraph from './lib/phenyl-module-graph.js'
import type { BumpType } from './lib/phenyl-module-graph'

const rootPath = pth.dirname(__dirname)
const modulesPath = rootPath + '/modules'

class CLI {
  constructor() {
    const rootPackageJson = require(rootPath + '/package.json')
    const moduleNames = fs.readdirSync(modulesPath).filter(moduleName => fs.statSync(modulesPath + '/' + moduleName).isDirectory())
    const packageJsonsByName = {}
    moduleNames.forEach(moduleName => {
      // $FlowIssue(load-package.json)
      packageJsonsByName[moduleName] = require(`${modulesPath}/${moduleName}/package.json`)
    })
    this.graph = new PhenylModuleGraph(rootPackageJson, packageJsonsByName)
  }

  bump(moduleName: string, bumpType: BumpType) {
    const phenylModulesByName = this.graph.bumpVersion(moduleName, bumpType)
    Object.keys(phenylModulesByName).forEach(name => {
      const phenylModule = phenylModulesByName[name]
      const pathToModule = __dirname + `/../modules/${name}`
      const packagejson = JSON.parse(fs.readFileSync(pathToModule + '/package.json', 'utf-8'))
      const oldVersion = packagejson.version
      const newVersion = phenylModule.version
      packagejson.version = newVersion
      fs.writeFileSync(pathToModule + '/package.json', JSON.stringify(packagejson, null, '  '), 'utf-8')

      if (bumpType === 'patch') {
        this.commitAndTag(oldVersion, newVersion, moduleName, pathToModule)
        this.publish(`v${newVersion}`)
      }
    })
  }

  createGitTag(moduleName, version) {
    return `${moduleName}-v${version}`
  }

  commitAndTag(oldVersion: string, newVersion: string, moduleName: string, pathToModule: string) {
    shell.exec(`git commit -am ':bookmark: Release ${moduleName}'`)
    shell.exec('git push origin master')
    const oldTag = this.createGitTag(moduleName, oldVersion)
    const newTag = this.createGitTag(moduleName, newVersion)

    const releaseNote = shell.exec(`git log --oneline --no-merges ${oldTag}...master ${pathToModule}`).stdout
    shell.exec(`git tag -a ${newTag} -m ${releaseNote}`)
    shell.exec(`git push origin ${newTag}`)
  }

  publish(tag: string) {
    shell.exec(`npm publish --tag ${tag}`)
  }

  clean() {
    this.graph.sortedModuleNames.forEach(name => {
      console.log(chalk.cyan(`\n[${name}] start clean`))
      const modulePath = `${modulesPath}/${name}`
      shell.rm('-rf', `${modulePath}/node_modules`, `${modulePath}/dist`, `${modulePath}/package-lock.json`)
      console.log(chalk.green(`[${name}] ✓ clean done`))
    })
  }

  test() {
    const { modulesByName } = this.graph
    const failedModules = []

    this.graph.sortedModuleNames.forEach(name => {
      console.log(chalk.cyan(`\n[${name}] start test`))
      const { scripts } = modulesByName[name]

      if (scripts && Object.keys(scripts).includes('test')) {
        shell.cd(`${modulesPath}/${name}`)
        if (shell.exec('npm test --color always').code !== 0) {
          failedModules.push(name)
        }
        shell.cd(rootPath)
      }
      else {
        shell.echo(`no test specified in ${name}`)
      }
    })

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
    const { modulesByName } = this.graph
    this.graph.sortedModuleNames.forEach(name => {
      const modulePath = `${modulesPath}/${name}`
      console.log(chalk.cyan(`[${name}] start install.`))

      const { dependingModuleNames, commonModuleNames } = modulesByName[name]
      dependingModuleNames.forEach(dependingModuleName => {
        shell.mkdir('-p', `${modulePath}/node_modules`)
        shell.cd(`${modulePath}/node_modules`)
        shell.ln('-sf', `../../${dependingModuleName}`, `${dependingModuleName}`)
        shell.cd(rootPath)
      })

      commonModuleNames.forEach(commonModuleName => {
        shell.mkdir('-p', `${modulePath}/node_modules`)
        shell.cd(`${modulePath}/node_modules`)
        shell.ln('-sf', `../../../node_modules/${commonModuleName}`, `${commonModuleName}`)
        shell.cd(rootPath)
      })

      shell.mkdir('-p', `${modulePath}/node_modules/.bin`)
      shell.cd(`${modulePath}/node_modules/.bin`)
      shell.ln('-sf', '../../../../node_modules/.bin/kocha', 'kocha')

      shell.cd(modulePath)
      shell.exec('npm install --color always --loglevel=error')
      shell.rm('-f', `${modulePath}/package-lock.json`)
      shell.cd(rootPath)
      console.log(chalk.green(`[${name}] ✓ install done.\n`))
    })
  }

  build() {
    this.graph.sortedModuleNames.forEach(name => {
      shell.exec(`BABEL_ENV=build babel modules/${name}/src -d modules/${name}/dist`)
    })
  }
}


const cli = new CLI()

const command = process.argv[2]
const moduleName = process.argv[3]

switch(command) {
  case 'build':
    cli.build()
    break
  case 'load':
    cli.load()
    break
  case 'test':
    cli.test()
    break
  case 'clean':
    cli.clean()
    break
  case 'bump:major':
    if (!moduleName) throw new Error('specify moduleName to bump version')
    cli.bump(moduleName, 'major')
    break
  case 'bump:minor':
    if (!moduleName) throw new Error('specify moduleName to bump version')
    cli.bump(moduleName, 'minor')
    break
  case 'bump:patch':
    if (!moduleName) throw new Error('specify moduleName to bump version')
    cli.bump(moduleName, 'patch')
    break
  default:
    throw new Error(`unknown command: ${command}`)
}
