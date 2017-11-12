// @flow

import kocha from 'kocha'
import PhenylMemoryClient, { MemoryKvsClient } from '../src/index.js'
import { assertEntityClient } from 'phenyl-interfaces'

const entityClient = new PhenylMemoryClient()
assertEntityClient(entityClient, kocha)
