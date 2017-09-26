// @flow
import type {
  Session
} from 'phenyl-interfaces'

import MemoryKvsClient from './kvs-client.js'

export default class MemorySessionClient extends MemoryKvsClient<Session> {
}
