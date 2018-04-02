// @flow

import mocha from 'mocha'
import assert from 'power-assert'
import { createEntityClient } from '../src/index.js'
import { assertEntityClient } from 'phenyl-interfaces/test-cases'

const entityClient = new createEntityClient()
assertEntityClient(entityClient, mocha, assert)
