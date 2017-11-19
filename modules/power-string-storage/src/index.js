// @flow
import StringMapBuilder from './string-map-builder.js'
import type { Restorable } from 'phenyl-interfaces'
import type { StringStorage } from '../decls/string-storage.js.flow'
import RestorableBuilder from './restorable-builder.js'

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
    const valuesToSet = []
    Object.keys(values).map(key => {
      valuesToSet.push([key, values[key]])
    })
    try {
      await this.storage.multiSet(valuesToSet)
    } catch (error) {
      return false
    }
    return true
  }

  async clear(): Promise<boolean> {
    const allKeys = await this.storage.getAllKeys()
    try {
      this.storage.multiRemove(allKeys)
    } catch (error) {
      return false
    }
    return true
  }

  async restore(nameSpace: string): Promise<Restorable> {
    const metaInfoStr = await this.storage.getItem(nameSpace)
    const metaInfo = JSON.parse(metaInfoStr)
    const { ids } = metaInfo
    const keyValueArray = await this.storage.multiGet(ids)
    const valueByKeys = keyValueArray.reduce((total, item) =>
        Object.assign(total, { [item[0]]: item[1] })
    , {})

    const restorableBuilder = new RestorableBuilder({
      metaInfo,
      valuesByKeys,
    })

    const restorable = restorableBuilder.build()
    return restorable
  }

  assign(ops): Promise<boolean> {

  }
}
