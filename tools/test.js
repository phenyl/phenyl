const fs = require('fs')
const chalk = require('chalk')

const PhenylModule = require('./lib/phenyl-module')
const path = __dirname + '/../modules'
const moduleNames = fs.readdirSync(path).filter(moduleName => fs.statSync(path + '/' + moduleName).isDirectory())

const phenylModules = moduleNames.map(moduleName => new PhenylModule(moduleName))
const failedModules = []

phenylModules.forEach(phenylModule => {
  console.log(
    chalk.cyan(`\n[${phenylModule.moduleName}] start test`)
  )
  const { passed, skipped } = phenylModule.test()
  if (!passed && !skipped) {
    failedModules.push(phenylModule.moduleName)
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
