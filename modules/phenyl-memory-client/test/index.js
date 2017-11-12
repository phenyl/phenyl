// @flow

import kocha from 'kocha'
import PhenylMemoryClient from '../src/index.js'
import { assertEntityClient } from 'phenyl-interfaces'

const entityClient = new PhenylMemoryClient()
assertEntityClient(entityClient, kocha)
