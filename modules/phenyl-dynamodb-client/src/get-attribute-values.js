// @flow

import type { ExpressionAttributeValues } from '../decls/attribute-values'

export const getAttributeValue = (param: any): ExpressionAttributeValues => {
  if (param == null) {
    return { NULL: true }
  }
  if (Array.isArray(param)) {
    if (param.every(element => typeof element === 'string')) {
      return { SS: param }
    }

    if (param.every(element => typeof element === 'number')) {
      return { NS: param.map(element => element.toString())}
    }

    if (param.every(element => element instanceof Buffer)) {
      return { BS: param.map(element => element.toString('base64'))}
    }
  }
  if (param instanceof Buffer) {}
  if (typeof param === 'object') {
    const map = {}
    Object.keys(param).forEach(key => {
      map[param[key]]

    })
    return { M: }

  }
  if (typeof param === 'number') {
    return { N: param.toString() }
  }
  if (typeof param === 'boolean') {
    return { BOOL: param.toString() }
  }
  if (typeof param === 'string') {
    return { S: param }

  }
}
