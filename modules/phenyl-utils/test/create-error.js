// @flow
import { describe, it } from 'mocha'
import assert from 'power-assert'
import {
  createError,
  createServerError,
  createLocalError,
} from '../src/create-error.js'

describe('createError', function () {

  it ('returns PhenylError from string. Default location is Local.', function () {
    const e = createError('Invalid value.')
    assert(e instanceof Error)
    assert(e.ok === 0)
    assert(e.at === 'local')
    assert(e.type === 'InvalidData')
    assert(e.message === 'Invalid value.')
    assert(e.stack)
    const json = e.toJSON()
    // Checking restorability
    assert.deepEqual(e, createError(json))
  })

  it ('returns PhenylError from string, with error type.', function () {
    const e = createError('Invalid value.', 'CodeProblem')
    assert(e instanceof Error)
    assert(e.ok === 0)
    assert(e.at === 'local')
    assert(e.type === 'CodeProblem')
    assert(e.message === 'Invalid value.')
    assert(e.stack)
    const json = e.toJSON()
    // Checking restorability
    assert.deepEqual(e, createError(json))
  })

  it ('returns PhenylError from string, with location.', function () {
    const e = createError('Invalid value.', null, 'server')
    assert(e instanceof Error)
    assert(e.ok === 0)
    assert(e.at === 'server')
    assert(e.type === 'BadRequest')
    assert(e.message === 'Invalid value.')
    assert(e.stack)
    const json = e.toJSON()
    // Checking restorability
    assert.deepEqual(e, createError(json))
  })

  it ('returns PhenylError from Error instance. Default location is Local.', function () {
    const e = createError(new Error('Invalid value.'))
    assert(e instanceof Error)
    assert(e.ok === 0)
    assert(e.at === 'local')
    assert(e.type === 'InvalidData')
    assert(e.message === 'Invalid value.')
    assert(e.stack)
    const json = e.toJSON()
    // Checking restorability
    assert.deepEqual(e, createError(json))
  })

  it ('returns PhenylError from ReferenceError instance. Default type is "CodeProblem", and it has no restorability.', function () {
    const e = createError(new ReferenceError('Invalid value.'))
    assert(e instanceof Error)
    assert(e.ok === 0)
    assert(e.at === 'local')
    assert(e.type === 'CodeProblem')
    assert(e.message === 'Invalid value.')
    assert(e.stack)
    const json = e.toJSON()
    assert(json.ok === 0)
    assert(json.at === 'local')
    assert(json.type === 'CodeProblem')
    assert(json.message === 'Invalid value.')
    assert(json.stack === e.stack)
    // No restorability
    assert.notDeepEqual(e, createError(json))
  })

  it ('returns PhenylError from ErrorDetail Object. Default location is Local.', function () {
    const e = createError({
      message:'Invalid value.',
      details: {
        type:'loginId', status: 'duplicate'
      }
    })
    assert(e instanceof Error)
    assert(e.ok === 0)
    assert(e.at === 'local')
    assert(e.type === 'InvalidData')
    assert(e.message === 'Invalid value.')
    assert(e.stack)
    assert(e.details.type === 'loginId')
    assert(e.details.status === 'duplicate')
    const json = e.toJSON()
    // Checking restorability
    assert.deepEqual(e, createError(json))
  })

})

describe('createServerError', function () {
  it ('returns ServerError from string.', function () {
    const e = createServerError('Invalid value.')
    assert(e instanceof Error)
    assert(e.ok === 0)
    assert(e.at === 'server')
    assert(e.type === 'BadRequest')
    assert(e.message === 'Invalid value.')
    assert(e.stack)
    const json = e.toJSON()
    // Checking restorability
    assert.deepEqual(e, createError(json))
  })

  it ('returns ServerError from string, with error type.', function () {
    const e = createServerError('Invalid value.', 'NotFound')
    assert(e instanceof Error)
    assert(e.ok === 0)
    assert(e.at === 'server')
    assert(e.type === 'NotFound')
    assert(e.message === 'Invalid value.')
    assert(e.stack)
    const json = e.toJSON()
    // Checking restorability
    assert.deepEqual(e, createError(json))
  })

  it ('returns ServerError from Error instance.', function () {
    const e = createServerError(new Error('Invalid value.'))
    assert(e instanceof Error)
    assert(e.ok === 0)
    assert(e.at === 'server')
    assert(e.type === 'BadRequest')
    assert(e.message === 'Invalid value.')
    assert(e.stack)
    const json = e.toJSON()
    // Checking restorability
    assert.deepEqual(e, createError(json))
  })

  it ('returns ServerError from ReferenceError instance. Default type is "InternalServer", and it has no restorability.', function () {
    const e = createServerError(new ReferenceError('Invalid value.'))
    assert(e instanceof Error)
    assert(e.ok === 0)
    assert(e.at === 'server')
    assert(e.type === 'InternalServer')
    assert(e.message === 'Invalid value.')
    assert(e.stack)
    const json = e.toJSON()
    assert(json.ok === 0)
    assert(json.at === 'server')
    assert(json.type === 'InternalServer')
    assert(json.message === 'Invalid value.')
    assert(json.stack === e.stack)
    // No restorability
    assert.notDeepEqual(e, createError(json))
  })
})

describe('createLocalError', function () {

  it ('returns LocalError from string.', function () {
    const e = createLocalError('Invalid value.')
    assert(e instanceof Error)
    assert(e.ok === 0)
    assert(e.at === 'local')
    assert(e.type === 'InvalidData')
    assert(e.message === 'Invalid value.')
    assert(e.stack)
    const json = e.toJSON()
    // Checking restorability
    assert.deepEqual(e, createError(json))
  })

  it ('returns LocalError from string, with error type.', function () {
    const e = createLocalError('Invalid value.', 'NetworkFailed')
    assert(e instanceof Error)
    assert(e.ok === 0)
    assert(e.at === 'local')
    assert(e.type === 'NetworkFailed')
    assert(e.message === 'Invalid value.')
    assert(e.stack)
    const json = e.toJSON()
    // Checking restorability
    assert.deepEqual(e, createError(json))
  })

  it ('returns LocalError from Error instance.', function () {
    const e = createLocalError(new Error('Invalid value.'))
    assert(e instanceof Error)
    assert(e.ok === 0)
    assert(e.at === 'local')
    assert(e.type === 'InvalidData')
    assert(e.message === 'Invalid value.')
    assert(e.stack)
    const json = e.toJSON()
    // Checking restorability
    assert.deepEqual(e, createError(json))
  })

  it ('returns LocalError from ReferenceError instance. Default type is "CodeProblem", and it has no restorability.', function () {
    const e = createLocalError(new ReferenceError('Invalid value.'))
    assert(e instanceof Error)
    assert(e.ok === 0)
    assert(e.at === 'local')
    assert(e.type === 'CodeProblem')
    assert(e.message === 'Invalid value.')
    assert(e.stack)
    const json = e.toJSON()
    assert(json.ok === 0)
    assert(json.at === 'local')
    assert(json.type === 'CodeProblem')
    assert(json.message === 'Invalid value.')
    assert(json.stack === e.stack)
    // No restorability
    assert.notDeepEqual(e, createError(json))
  })
})
