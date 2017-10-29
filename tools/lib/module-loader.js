const shell = require('shelljs')
const path = require('path')
const chalk = require('chalk')

module.exports = class ModuleLoader {
  constructor(modules) {
    this.visitedModules = {}
    this.loadedModules = {}
    this.modules = modules
  }

  load(moduleName) {
    this.installSubModules(moduleName)
  }

  installSubModules(moduleName) {
    if (this.loadedModules[moduleName]) {
      return
    }

    if (this.visitedModules[moduleName]) {
      throw new Error('Circular dependencies detected.')
    }

    this.visitedModules[moduleName] = true

    const dependentModules = this.getDependentModules(moduleName)

    if (dependentModules.length) {
      dependentModules.forEach(depModuleName => {
        this.linkModule(depModuleName, moduleName)
        this.installSubModules(depModuleName)
      })
    }

    console.log(chalk.magenta(`[${moduleName}] All dependent modules were resolved.`))
    console.log(chalk.cyan(`[${moduleName}] Running npm install.`))
    shell.cd(`modules/${moduleName}/`)
    shell.exec('npm install --color always')
    shell.cd('../../')
    console.log(chalk.green(`[${moduleName}] ✓ install done.\n`))
    this.loadedModules[moduleName] = true
  }

  linkModule(moduleName, ownerModuleName) {
    shell.mkdir('-p', `modules/${ownerModuleName}/node_modules`)
    shell.cd(`modules/${ownerModuleName}/node_modules`)
    console.log(chalk.cyan(`[${ownerModuleName}] linking ${moduleName}`))
    shell.ln('-s', `../../${moduleName}`, moduleName)
    shell.cd('../../../')
  }

  getDependentModules(moduleName) {
    const packageJson = require(path.join(__dirname, `../../modules/${moduleName}/package.json`))
    let dependentModules = []

    if (packageJson.dependencies != null) {
      const dependencies = Object.keys(packageJson.dependencies)
      dependentModules = dependentModules.concat(dependencies.filter(dependency => (this.modules.includes(dependency))))
    }

    if (packageJson.devDependencies != null) {
      const devDependencies = Object.keys(packageJson.devDependencies)
      dependentModules = dependentModules.concat(devDependencies.filter(devDependency => (this.modules.includes(devDependency))))
    }
    return dependentModules
  }
}
