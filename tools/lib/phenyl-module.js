const shell = require('shelljs')
module.exports = class PhenylModule {
  constructor(moduleName) {
    this.moduleName = moduleName
  }

  test() {
    let passed = false
    let skipped = false

    const pathToModuleFromRoot = `modules/${this.moduleName}`
    shell.cd(pathToModuleFromRoot)
    const scripts = require('../../' + pathToModuleFromRoot + '/package.json').scripts

    if (scripts && Object.keys(scripts).includes('test')) {
      passed = (shell.exec('npm test --color always').code === 0)
    }
    else {
      skipped = true
      shell.echo(`no test specified in ${this.moduleName}`)
    }
    shell.cd(`../../`)
    return { passed, skipped }
  }

  build() {
    shell.exec(`BABEL_ENV=build babel modules/${this.moduleName}/src -d modules/${this.moduleName}/dist`)
  }
}
