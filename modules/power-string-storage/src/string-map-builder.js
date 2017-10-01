// @flow
import type { Restorable } from 'phenyl-interfaces'
import type { StringMap } from '../decls/string-map.js.flow'

type PlainStringMapBuilder = {
  target: Restorable,
  nameSpace: string,
  maxDepth?: ?number,
}

export default class StringMapBuilder {
  target: Restorable
  nameSpace: string
  maxDepth: number

  constructor(plain: PlainStringMapBuilder) {
    this.target = plain.target
    this.nameSpace = plain.nameSpace
    this.maxDepth = plain.maxDepth || 2
  }

  exploreArray(arr: Array<any>, currentDepth: number, currentKey: string): StringMap {
    const values = {}
    const ids = []
    let lastInsertId = 0
    const nextDepth = currentDepth + 1

    arr.forEach(item => {
      const id = ++lastInsertId
      ids.push(id)
      const nextKey = [currentKey, id].join('.')
      const itemValues = this.explore(item, nextDepth, nextKey)
      Object.assign(values, itemValues)
    }, this)

    values[currentKey] = JSON.stringify({ ids, lastInsertId })
    return values
  }

  explore(obj: Object, currentDepth: number, currentKey: string): StringMap {
    const values = {}

    if (currentDepth === this.maxDepth) {
      return { [currentKey]: JSON.stringify(obj) }
    }

    Object.keys(obj).forEach(key => {
      const nextKey = [currentKey, key].join('.')
      const nextDepth = currentDepth + 1
      const child = obj[key]
      if (Array.isArray(child)) {
        const arrayValues = this.exploreArray(child, nextDepth, nextKey)
        Object.assign(values, arrayValues)
        return
      }

      if (typeof child === 'object') {
        const objValues = this.explore(child, nextDepth, nextKey)
        Object.assign(values, objValues)
        return
      }

      Object.assign(values, { [nextKey]: JSON.stringify(child) })
    })
    return values
  }

  build(): StringMap {
    const stringMap = {[this.nameSpace]: JSON.stringify({ maxDepth: this.maxDepth })}
    return Object.assign(stringMap, this.explore(this.target, 0, this.nameSpace))
  }
}