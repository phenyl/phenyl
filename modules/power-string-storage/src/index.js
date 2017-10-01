// @flow
import StringMapBuilder from './string-map-builder.js'
import type { Restorable } from 'phenyl-interfaces'
import type { StringStorage } from '../decls/async-storage.js.flow'
import type { StringMap } from '../decls/string-map.js.flow'

export default class PowerStringStorage {
  storage: StringStorage

  constructor(storage: StringStorage) {
    this.storage = storage
  }

  async register(obj: Restorable, nameSpace: string, maxDepth?: number): Promise<boolean> {
    const builder = new StringMapBuilder({
      target: obj,
      nameSpace,
      maxDepth,
    })

    const values = builder.build()
  }

  async clear(): Promise<boolean> {
    const allKeys = await this.storage.getAllKeys()
    return this.storage.multiRemove(allKeys)
  }

  restore(): Promise<Restorable> {
  }

  assign(ops: SetUnsetOperator): Promise<boolean> {

  }
}
