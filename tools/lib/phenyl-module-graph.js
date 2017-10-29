// @flow
import PhenylModule from './phenyl-module.js'

export opaque type Version = string
export type BumpType = 'major' | 'minor' | 'patch'

export type PackageJSON = {
  name: string,
  version: Version,
  scripts: ?{ [scriptName: string]: string },
  dependencies: ?{ [moduleName: string]: Version },
  devDependencies: ?{ [moduleName: string]: Version },
}

type PhenylModulesByName = { [moduleName: string]: PhenylModule }

export default class PhenylModuleGraph {
  modulesByName: PhenylModulesByName
  sortedModuleNames: Array<string>

  constructor(packageJsonsByName: { [moduleName: string]: PackageJSON }) {
    const moduleNames = Object.keys(packageJsonsByName)

    this.modulesByName = {}
    moduleNames.forEach(moduleName => {
      const packageJson = packageJsonsByName[moduleName]
      const dependedModuleNames = getDependedModuleNames(moduleName, packageJsonsByName)
      this.modulesByName[moduleName] = createPhenylModule(packageJson, moduleNames, dependedModuleNames)
    })
    this.sortedModuleNames = topologicalSort(this.modulesByName)
  }

  bumpVersion(moduleName: string, bumpType: BumpType): PhenylModulesByName {
    const affected = {}
    const { modulesByName } = this

    function bump(phenylModule) {
      const newVersion = bumpByType(phenylModule.version, bumpType)
      const newPhenylModule = new PhenylModule(Object.assign({}, phenylModule, { version: newVersion }))
      affected[newPhenylModule.name] = newPhenylModule
      newPhenylModule.dependedModuleNames.forEach(name => {
        bump(modulesByName[name])
      })
    }
    bump(modulesByName[moduleName])
    return affected
  }
}

/**
 * Factory of PhenylModule
 */
function createPhenylModule(packageJson: PackageJSON, phenylModuleNames: Array<string>, dependedModuleNames: Array<string>): PhenylModule {
  const dependencies = packageJson.dependencies || {}
  const devDependencies = packageJson.devDependencies || {}

  const params = {
    name: packageJson.name,
    version: packageJson.version,
    scripts: packageJson.scripts,
    dependingModuleNames: phenylModuleNames.filter(moduleName => dependencies[moduleName] || devDependencies[moduleName]),
    dependedModuleNames,
  }
  return new PhenylModule(params)
}
/**
 * TopologicalSort of phenyl modules by dependencies
 */
function topologicalSort(modulesByName): Array<string> {
  const sorted = []
  const visited = {}
  const loaded = {}

  function visit(phenylModule) {
    const { name } = phenylModule
    if (loaded[name]) {
      return
    }
    if (visited[name]) {
      throw new Error('Circular dependencies detected.')
    }
    visited[name] = true

    if (phenylModule.dependingModuleNames.length) {
      phenylModule.dependingModuleNames.forEach(depModuleName => {
        visit(modulesByName[depModuleName])
      })
    }
    sorted.push(name)
    loaded[name] = true
  }

  for (const moduleName of Object.keys(modulesByName)) {
    visit(modulesByName[moduleName])
  }
  return sorted
}

function getDependedModuleNames(moduleName, packageJsonsByName): Array<string> {
  return Object.keys(packageJsonsByName).filter(currentModuleName => {
    const packageJson = packageJsonsByName[currentModuleName]
    const dependencies = packageJson.dependencies || {}
    const devDependencies = packageJson.devDependencies || {}
    return dependencies[moduleName] || devDependencies[moduleName]
  })
}

function bumpByType(version: Version, type: BumpType): Version {
  const [major, minor, patch] = version.split('.').map(str => parseInt(str))
  switch (type) {
    case 'major':
      return [major + 1, minor, patch].join('.')
    case 'minor':
      return [major, minor + 1, patch].join('.')
    case 'patch':
      return [major, minor, patch + 1].join('.')
    default:
      throw new Error(`Unknown BumpType: "${type}".`)
  }
}

function main() {
  const fs = require('fs')
  const path = __dirname + '/../../modules'
  const moduleNames = fs.readdirSync(path).filter(moduleName => fs.statSync(path + '/' + moduleName).isDirectory())
  const packageJsonsByName = {}
  moduleNames.forEach(moduleName => {
    // $FlowIssue(load-package.json)
    packageJsonsByName[moduleName] = require(`${path}/${moduleName}/package.json`)
  })
  const graph = new PhenylModuleGraph(packageJsonsByName)
  console.log(graph.sortedModuleNames)
  console.log(graph.bumpVersion('phenyl-interfaces', 'minor'))
}

main()
