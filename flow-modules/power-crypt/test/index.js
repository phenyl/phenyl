// @flow

import { describe, it } from 'mocha'
import assert from 'power-assert'
import powerCrypt from '../src/index.js'

describe('powerCrypt', () => {
  it('crypts string, default encoding is base64', () => {
    const crypted = powerCrypt('shinout')
    assert(typeof crypted === 'string')
  })

  it('crypts string with salt', () => {
    const crypted = powerCrypt('shinout', { salt: 'xx' })
    const cryptedWithoutSalt = powerCrypt('shinout')
    assert(crypted !== cryptedWithoutSalt)
  })

  it('crypts string with streching', () => {
    const crypted = powerCrypt('shinout', { nStretch: 400 })
    const cryptedWith1000Streaches = powerCrypt('shinout')
    assert(crypted !== cryptedWith1000Streaches)
  })

  it('crypts string with hex encoding', () => {
    const cryptedHex = powerCrypt('shinout', { encode: 'hex' })
    assert(isNaN(parseInt(cryptedHex, 16)) === false)
  })

  it('crypts string with algorithm', () => {
    const crypted512 = powerCrypt('shinout', { algorithm: 'sha512' })
    const crypted256 = powerCrypt('shinout')
    assert(crypted512 != crypted256)
  })

  it('crypts string with various options', () => {
    const crypted = powerCrypt('shinout', {
      algorithm: 'sha512',
      nStretch: 123,
      encode: 'hex',
      salt: '==THIS IS THE SALT==',
    })
    assert(typeof crypted === 'string')
    assert(isNaN(parseInt(crypted, 16)) === false)
  })
})
