// @flow
import { assignWithRestoration } from 'power-assign/jsnext'
import type {
  Entity,
  PreEntity,
  KvsClient,
  Id,
} from 'phenyl-interfaces'
import { randomString } from 'phenyl-utils/jsnext'

interface KeyValuePool<T> {
  [id: Id]: T
}

type MemoryKvsClientParams<T> = {
  pool?: KeyValuePool<T>
}

export default class MemoryKvsClient<T: Entity> implements KvsClient<T> {
  pool: KeyValuePool<T>

  constructor(params: MemoryKvsClientParams<T> = {}) {
    // $FlowIssue(empty-object-is-object-as-a-map)
    this.pool = params.pool || {}
  }

  async get(id: ?Id): Promise<?T> {
    if (id == null) {
      return null
    }
    return this.pool[id]
  }

  async create(value: T | PreEntity<T>): Promise<T> {
    if (value.id != null) {
      if (this.pool[value.id] != null) {
        throw new Error(`The given id "${value.id}" already exists in memory pool.`)
      }
      return this.set(value)
    }

    const newValue = assignWithRestoration(value, { id: randomString() })
    return this.set(newValue)
  }

  async set(value: T): Promise<T> {
    this.pool = assignWithRestoration(this.pool, { $set: { [value.id]: value } })
    return value
  }

  async delete(id: ?Id): Promise<boolean> {
    if (id == null || this.pool[id] == null) {
      return false
    }
    this.pool = assignWithRestoration(this.pool, { $unset: { [id]: '' } })
    return true
  }
}
