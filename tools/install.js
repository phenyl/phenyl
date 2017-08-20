const shell = require('shelljs')
const path = require('path')

const phenylModules = shell.exec(
  'ls -F ./modules | grep / | tr -d "/"',
  { silent: true }
).trim().split('\n')

const linkPhenylModules = (moduleNames) => {
  moduleNames.forEach(module => {
    shell.cd('node_modules')
    shell.echo(`link ${module}`)
    shell.ln('-s', `../../${module}`, module)
    shell.cd('../')
  })
}

shell.exec('npm i')

phenylModules.forEach(module => {
  shell.cd(`modules/${module}`)

  const packageJson = require(path.join(__dirname, `../modules/${module}/package.json`))
  let modulesInPhenyl = []

  if (packageJson.dependencies != null) {
    const dependencies = Object.keys(packageJson.dependencies)
    modulesInPhenyl = modulesInPhenyl.concat(dependencies.filter(dependency => (phenylModules.includes(dependency))))
  }

  if (packageJson.devDependencies != null) {
    const devDependencies = Object.keys(packageJson.devDependencies)
    modulesInPhenyl = modulesInPhenyl.concat(devDependencies.filter(devDependency => (phenylModules.includes(devDependency))))
  }

  shell.mkdir('-p', 'node_modules')
  linkPhenylModules(modulesInPhenyl)
  shell.exec('npm i')

  shell.cd('../../')
})
