const fs = require('fs')
const PhenylModule = require('./lib/phenyl-module')
const ModuleLoader = require('./lib/module-loader')

const pathToModules = __dirname + '/../modules'
const moduleNames = fs.readdirSync(pathToModules).filter(moduleName => fs.statSync(pathToModules + '/' + moduleName).isDirectory())

const phenylModules = moduleNames.map(moduleName => new PhenylModule(moduleName))
const moduleLoader = new ModuleLoader(moduleNames)

phenylModules.forEach(phenylModule => moduleLoader.load(phenylModule.moduleName))

