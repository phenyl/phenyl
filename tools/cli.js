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
      const pathToModule = __dirname + `/../modules/${name}`
      const packagejson = JSON.parse(fs.readFileSync(pathToModule + '/package.json', 'utf-8'))
      const oldVersion = packagejson.version
      const newVersion = phenylModule.version
      packagejson.version = newVersion
      fs.writeFileSync(path, JSON.stringify(packagejson, null, '  '), 'utf-8')

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
      shell.cd(`modules/${name}`)
      shell.rm('-rf', 'node_modules dist')
      shell.cd('../../')
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
        shell.cd(`modules/${name}`)
        if (shell.exec('npm test --color always').code !== 0) {
          failedModules.push(name)
        }
        shell.cd('../../')
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
      console.log(chalk.cyan(`[${name}] start install.`))

      const { dependingModuleNames } = modulesByName[name]
      dependingModuleNames.forEach(dependingModuleName => {
        shell.mkdir('-p', `modules/${name}/node_modules`)
        shell.cd(`modules/${name}/node_modules`)
        shell.ln('-s', `../../${dependingModuleName}`, `${dependingModuleName}`)
        shell.cd('../../../')
      })

      shell.cd(`modules/${name}`)
      shell.exec('npm install --color always --loglevel=error')
      shell.cd('../../')
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
