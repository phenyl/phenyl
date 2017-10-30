import chalk from 'chalk'
import { getPhenylModules } from './lib/phenyl-module.js'

const phenylModules = getPhenylModules()

const failedModules = []

phenylModules.forEach(phenylModule => {
  console.log(
    chalk.cyan(`\n[${phenylModule.moduleName}] start test`)
  )
  const { path, command, shouldSkip } = phenylModule.test()

  if (shouldSkip) {


  }
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
