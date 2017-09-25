// @flow

import type {
  DotNotationString,
  SortNotation,
  Restorable,
} from 'phenyl-interfaces'

export function sortByNotation<T: Restorable>(arr: Array<T>, sortNotation: SortNotation): Array<T> {
  const newArr = arr.slice()
  const sortDnStrs = Object.keys(sortNotation)
  newArr.sort((a, b) => {
    for (const sortDnStr of sortDnStrs) {
      const valA = a[sortDnStr]
      const valB = b[sortDnStr]
      if (valA !== valB) {
        const direction = sortNotation[sortDnStr]
        return valA > valB ? direction : (direction ^ -1) + 1
      }
    }
    return 0
  })
  return newArr
}
