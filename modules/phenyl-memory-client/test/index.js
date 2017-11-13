// @flow

import kocha from 'kocha'
import PhenylMemoryClient from '../src/index.js'
import { assertEntityClient } from 'phenyl-interfaces/test-cases'

const entityClient = new PhenylMemoryClient()
assertEntityClient(entityClient, kocha)
