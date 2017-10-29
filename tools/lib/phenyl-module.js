const shell = require('shelljs')
module.exports = class PhenylModule {
  constructor(moduleName) {
    this.moduleName = moduleName
    this.passingTest = false
    this.skipTest = false
  }

  test() {
    const pathToModuleFromRoot = `modules/${this.moduleName}`
    shell.cd(pathToModuleFromRoot)
    const scripts = require('../../' + pathToModuleFromRoot + '/package.json').scripts

    if (scripts && Object.keys(scripts).includes('test')) {
      if (shell.exec('npm test --color always').code === 0) {
        this.passingTest = true
      }
    } else {
      this.skipTest = true
      shell.echo(`no test specified in ${this.moduleName}`)
    }

    shell.cd(`../../`)
  }

  build() {
    shell.exec(`BABEL_ENV=build babel modules/${this.moduleName}/src -d modules/${this.moduleName}/dist`)
  }
}
