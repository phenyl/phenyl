import shell from 'shelljs'
import chalk from 'chalk'
import fs from 'fs'
import PhenylModuleGraph from './lib/phenyl-module-graph.js'
import type { BumpType } from './lib/phenyl-module-graph'


class CLI {
  constructor() {
    const path = __dirname + '/../modules'
    const moduleNames = fs.readdirSync(path).filter(moduleName => fs.statSync(path + '/' + moduleName).isDirectory())
    const packageJsonsByName = {}
    moduleNames.forEach(moduleName => {
      // $FlowIssue(load-package.json)
      packageJsonsByName[moduleName] = require(`${path}/${moduleName}/package.json`)
    })
    this.graph = new PhenylModuleGraph(packageJsonsByName)
  }

  bump(moduleName: string, bumpType: BumpType) {
    const phenylModulesByName = this.graph.bumpVersion(moduleName, bumpType)
    Object.keys(phenylModulesByName).forEach(name => {
      const phenylModule = phenylModulesByName[name]
      const path = __dirname + `/../modules/${name}/package.json`
      const packagejson = JSON.parse(fs.readFileSync(path, 'utf-8'))
      packagejson.version = phenylModule.version
      fs.writeFileSync(path, JSON.stringify(packagejson, null, '  '), 'utf-8')
    })
    // TODO npm publish
  }

  clean() {
    const commands = this.graph.getCleanCommands()
    Object.keys(commands).forEach(name => {
      console.log(chalk.cyan(`\n[${name}] start clean`))
      const commandsArr = commands[name]
      commandsArr.forEach(command => {
        if (command.option) {
          command.path.unshift(command.option)
        }
        shell[command.name](...command.path)
      })
      console.log(chalk.green(`[${name}] ✓ clean done`))
    })
  }

  test() {
    const failedModules = []
    const commandsByName = this.graph.getTestCommands()
    Object.keys(commandsByName).forEach(name => {
      console.log(chalk.cyan(`\n[${name}] start test`))
      const commands = commandsByName[name]
      if (commands.length) {
        commands.forEach(command => {
          if (typeof command === 'string') {
            if (shell.exec(command).code !== 0) {
              failedModules.push(name)
            }
          }
          else {
            if (command.option) {
              command.path.unshift(option)
            }
            shell[command.name](...command.path)
          }
        })
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
    const commands = this.graph.getLoadCommands()
    Object.keys(commands).forEach(name => {
      console.log(chalk.cyan(`[${name}] start install.`))
      commands[name].forEach(command => {
        if (typeof command === 'string') {
          shell.exec(command)
        }
        else {
          if (command.option) {
            command.path.unshift(command.option)
          }
          shell[command.name](...command.path)
        }
      })
      console.log(chalk.green(`[${name}] ✓ install done.\n`))
    })
  }

  build() {
    this.graph.getBuildCommands().forEach(command => shell.exec(command))
  }
}


const cli = new CLI()

const [node, path, command, moduleName] = process.argv

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
