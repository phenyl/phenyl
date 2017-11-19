// @flow

import { describe, it } from 'kocha'
import RestorableBuilder from '../src/restorable-builder.js'
import assert from 'power-assert'

describe('RestorableBuilder', function () {
  it ('returns restorable from string map', async function () {
    const storage = {
      'user': '{"maxDepth":3,"ids":["user.name.first","user.name.last","user.favorites.music.1","user.favorites.music.2","user.favorites.music","user.favorites.movie.1","user.favorites.movie"]}',
      'user.name.first': '"Naomi"',
      'user.name.last': '"Campbell"',
      'user.favorites.music.1': '{"title":"LA・LA・LA LOVE SONG","singer":"Toshinobu Kubota"}',
      'user.favorites.music.2': '{"title":"Windy Lady","singer":"Tatsuro Yamashita"}',
      'user.favorites.music': '{"ids":[1,2],"lastInsertId":2}',
      'user.favorites.movie.1': '{"title":"Ugly Betty","year":2007}',
      'user.favorites.movie': '{"ids":[1],"lastInsertId":1}',
    }

    const keyValueArray = []
    Object.keys(storage).forEach(key => {
      const arr = []
      arr.push(key)
      arr.push(storage[key])
      keyValueArray.push(arr)
    })

    const metaInfo = JSON.parse(keyValueArray.shift()[1])

    const restorableBuilder = new RestorableBuilder({
      keyValueArray,
      metaInfo,
    })
    const user = restorableBuilder.build()
    console.log(user)

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
  })
})
