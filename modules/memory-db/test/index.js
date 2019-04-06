// @flow

import mocha, { describe } from 'mocha'
import assert from 'power-assert'
import { createEntityClient } from '../src/index.js'
import { assertEntityClient } from 'phenyl-interfaces/test-cases'

const entityClient = new createEntityClient()

describe('PhenylMemoryDb as EntityClient', () => {
  assertEntityClient(entityClient, mocha, assert)
})
