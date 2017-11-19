// @flow
import StringMapBuilder from './string-map-builder.js'
import type {
  Restorable,
  UpdateOperation
} from 'phenyl-interfaces'
import type { StringStorage } from '../decls/string-storage.js.flow'
import RestorableBuilder from './restorable-builder.js'

type ObjectSkeleton = Object

export default class PowerPersist {
  storage: StringStorage
  skeletons: {
    [nameSpace: string]: ObjectSkeleton
  }

  constructor(storage: StringStorage) {
    this.storage = storage
  }

  /**
   * @public
   * Register an object to key-value storage.
   * For each termination node (≒value), key is DocumentPath of the value.
   * maxDepth is the maximum length of the DocumentPath. default = 3.
   */
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

  /**
   * @public
   * Update the registered object with the given UpdateOperation.
   */
  async update(operation: UpdateOperation): Promise<boolean> {
    // TODO
    return true
  }

  /**
   * @public
   * Clear all the registered objects.
   */
  async clear(): Promise<boolean> {
    const allKeys = await this.storage.getAllKeys()
    try {
      this.storage.multiRemove(allKeys)
    } catch (error) {
      return false
    }
    return true
  }

  /**
   * @public
   * Restore whole the stored object from the storage.
   */
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
}
