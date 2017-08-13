const shell = require('shelljs')

const phenylModules = shell.ls('./modules')

phenylModules.forEach(module => {
  shell.cd(`modules/${module}`)
  shell.rm('-rf', 'node_modules')
  shell.cd('../../')
})
