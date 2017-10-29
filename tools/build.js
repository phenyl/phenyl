const fs = require('fs')

const PhenylModule = require('./lib/phenyl-module')
const path = __dirname + '/../modules'
const moduleNames = fs.readdirSync(path).filter(moduleName => fs.statSync(path + '/' + moduleName).isDirectory())

const phenylModules = moduleNames.map(moduleName => new PhenylModule(moduleName))

phenylModules.forEach(phenylModule => phenylModule.build())
