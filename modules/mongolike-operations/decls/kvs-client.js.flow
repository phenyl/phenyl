// @flow

import type { Id } from './id.js.flow'
import type { Entity, PreEntity } from './entity.js.flow'

export interface KvsClient<T: Entity> {
  get(id: ?Id): Promise<?T>,
  create(value: PreEntity<T>): Promise<T>,
  set(value: T): Promise<T>,
  delete(id: ?Id): Promise<boolean>,
}
