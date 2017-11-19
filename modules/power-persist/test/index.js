// @flow

import { describe, it } from 'kocha'
import PowerPersist from '../src'
import assert from 'power-assert'

describe('', function () {
  it('', function () {
    const powerPersist = new PowerPersist({})
    const user = powerPersist.restore('user')

    const expectedUser = {
      name: {
        first: 'Naomi',
        last: 'Campbell',
      },
      favorites: {
        music: [
          {
            title: 'LA・LA・LA LOVE SONG',
            singer: 'Toshinobu Kubota',
          },
          {
            title: 'Windy Lady',
            singer: 'Tatsuro Yamashita',
          }
        ],
        movie: [
          {
            title: 'Ugly Betty',
            year: 2007,
          }
        ]
      },
    }
    assert.deepEqual(expectedUser, user)
  })
})
