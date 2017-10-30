import { getPhenylModules } from './lib/phenyl-module.js'
import shell from 'shelljs'

getPhenylModules().forEach(phenylModule => shell.exec(phenylModule.getBuildCommand()))
