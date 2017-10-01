// @flow

import { describe, it } from 'kocha'
import StringMapBuilder from '../src/string-map-builder.js'
import assert from 'power-assert'

describe('StringMapBuilder', function () {
  it ('', async function () {
    const user = {
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
    const builder = new StringMapBuilder({
      target: user,
      nameSpace: 'user',
      maxDepth: 3,
    })

    const stringMap = builder.build()

    const expectedStorage = {
      'user': '{"maxDepth":3}',
      'user.name.first': '"Naomi"',
      'user.name.last': '"Campbell"',
      'user.favorites.music.1': '{"title":"LA・LA・LA LOVE SONG","singer":"Toshinobu Kubota"}',
      'user.favorites.music.2': '{"title":"Windy Lady","singer":"Tatsuro Yamashita"}',
      'user.favorites.music': '{"ids":[1,2],"lastInsertId":2}',
      'user.favorites.movie.1': '{"title":"Ugly Betty","year":2007}',
      'user.favorites.movie': '{"ids":[1],"lastInsertId":1}',
    }

    assert.deepEqual(stringMap, expectedStorage)
  })
})
