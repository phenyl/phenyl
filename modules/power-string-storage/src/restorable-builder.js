// @flow
import type {
  Restorable,
  DocumentPath,
} from 'phenyl-interfaces'
import PowerAssign from 'power-assign/jsnext'
import { getNestedValue } from 'phenyl-utils/jsnext'

type PlainRestorableBuilder = {
  metaInfo: { ids: Array<string>, maxDepth: number },
  valuesByKeys: { [key: string]: string },
}

export default class RestorableBuilder {
  metaInfo: { ids: Array<string>, maxDepth: number }
  valuesByKeys: { [key: string]: string }

  constructor(plain: PlainRestorableBuilder) {
    this.valuesByKeys = plain.valuesByKeys
    this.metaInfo = plain.metaInfo
  }

  async build() {

    const restored = {}

    Object.keys(this.valuesByKeys).forEach(key => {
      this.restoreKeyValue(key, restored)
    })
    return restored
  }

  restoreKeyValue(key: string, restored: { [key: string]: any }): void {
    const keyPathArr = this.parseDocPath(key)

    if (this.isArrayElement(keyPathArr[keyPathArr.length - 1])) {
      keyPathArr.pop()
      const parentKeyPath = keyPathArr.join('.')
      if (this.valuesByKeys[parentKeyPath] != null) {
        this.restoreKeyValue(parentKeyPath, {})
      }
    } else if (keyPathArr.some(keyPath => this.isArrayElement(keyPath))) {
      keyPathArr.pop()
      const keyPathArrWithoutLastProperty = keyPathArr
      const elementId = keyPathArr.pop()
      const parentKeyPath = keyPathArr.join('.')
      if (this.valuesByKeys[parentKeyPath] != null) {
        this.restoreKeyValue(parentKeyPath, {})
      }

      if (this.valuesByKeys[parentKeyPath][elementId] != null) {
        this.restoreKeyValue(keyPathArrWithoutLastProperty, {})
      }
    }

    PowerAssign.assign(restored, this.valuesByKeys[keyPathArr])

    delete this.valuesByKeys[key]
  }

  isArrayElement(keyPath: string): boolean {
    return /^\$\d+$/.test(keyPath)
  }

  parseDocPath(docPath: DocumentPath): Array<string> {
    return docPath.split(/[.[]/).map(attribute =>
      attribute.charAt(0) === '$' ? attribute.slice(0, -1) : attribute
    )
  }

  arr(): Restorable {
    return {}
  }

  createPlain(): Restorable {
    return {}
  }

  getValue(docPath: DocumentPath): any {
    let value = null
    this.keyValueArray.forEach(arr => {
      arr.forEach(key => {
        if (key === docPath) {
          value = arr[1]
        }
      })
    })
    console.log(value)
    return value
  }


}
