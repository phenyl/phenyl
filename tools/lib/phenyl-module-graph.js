// @flow
import PhenylModule from './phenyl-module.js'
import type { PackageJSON } from './phenyl-module.js'

export type Version = string
export type BumpType = 'major' | 'minor' | 'patch'
export type BumpTypesByModuleName = { [moduleName: string]: BumpType }
export type PackageJSONsByPath = { [modulePath: string]: PackageJSON }
export type PhenylModulesByName = { [moduleName: string]: PhenylModule }
export type VersionsByModuleName = { [moduleName: string]: Version }

export default class PhenylModuleGraph {
  rootPath: string
  modulesByName: PhenylModulesByName
  moduleNames: Array<string>
  rootPackageJson: PackageJSON

  constructor(rootPath: string, rootPackageJson: PackageJSON, packageJsons: PackageJSONsByPath) {
    this.rootPath = rootPath
    this.rootPackageJson = rootPackageJson
    this.modulesByName = Object.keys(packageJsons).reduce((acc, modulePath) => {
      const packageJson = packageJsons[modulePath]
      acc[packageJson.name] = PhenylModule.create(modulePath, packageJson)
      return acc
    }, {})

    this.moduleNames = topologicalSort(this.modulesByName)
  }

  get commonModuleNames(): Array<string> {
    return [].concat(
      Object.keys(this.rootPackageJson.dependencies || {}),
      Object.keys(this.rootPackageJson.devDependencies || {}),
    )
  }

  get phenylModules(): Array<PhenylModule> {
    return this.moduleNames.map(name => this.modulesByName[name])
  }

  getModule(moduleName: string): PhenylModule {
    return this.modulesByName[moduleName]
  }

  getBumpedVersions(modulesToBump: BumpTypesByModuleName): VersionsByModuleName {
    const moduleNamesToBump = Object.keys(modulesToBump)
    const newVersions = moduleNamesToBump.reduce((acc, name) => {
      const phenylModule = this.modulesByName[name]
      acc[name] = bumpByType(phenylModule.version, modulesToBump[name])
      return acc
    }, {})

    let newlyPatchBumped = []
    do {
      newlyPatchBumped = this.phenylModules
        .filter(phenylModule => newVersions[phenylModule.name] == null)
        .filter(phenylModule => phenylModule.hasDependencies(...Object.keys(newVersions)))
      newlyPatchBumped.forEach(phenylModule => {
        newVersions[phenylModule.name] = bumpByType(phenylModule.version, 'patch')
      })
    } while (newlyPatchBumped.length > 0)

    return newVersions
  }
}

/**
 * TopologicalSort of phenyl modules by dependencies
 */
function topologicalSort(modulesByName: PhenylModulesByName): Array<string> {
  const sorted = []
  const visited = {}
  const loaded = {}

  function visit(phenylModule: PhenylModule) {
    const { name } = phenylModule
    if (loaded[name]) {
      return
    }
    if (visited[name]) {
      throw new Error('Circular dependencies detected.')
    }
    visited[name] = true

    const dependingNames = phenylModule.allDependencies.filter(name => modulesByName[name])
    dependingNames.forEach(name => {
      visit(modulesByName[name])
    })
    sorted.push(name)
    loaded[name] = true
  }

  for (const moduleName of Object.keys(modulesByName)) {
    visit(modulesByName[moduleName])
  }
  return sorted
}

function bumpByType(version: Version, type: BumpType): Version {
  const [major, minor, patch] = version.split('.').map(str => parseInt(str))
  switch (type) {
    case 'major':
      return [major + 1, 0, 0].join('.')
    case 'minor':
      return [major, minor + 1, 0].join('.')
    case 'patch':
      return [major, minor, patch + 1].join('.')
    default:
      throw new Error(`Unknown BumpType: "${type}".`)
  }
}
