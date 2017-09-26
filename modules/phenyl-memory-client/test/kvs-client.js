// @flow
import { describe, it } from 'kocha'
import MemoryKvsClient from '../src/kvs-client.js'
import type { Session } from 'phenyl-interfaces'

type DeviceId = {
  id: string, // user id
  deviceId: string,
  phoneType: 'Android' | 'iOS'
}

class DeviceIdClient extends MemoryKvsClient<DeviceId> {
}

describe('MemoryKvsClient', async () => {

  it('kvs', async () => {
    const kvsClient = new DeviceIdClient()
    console.log(kvsClient)
    const noval = await kvsClient.get('shinout')
    console.log(noval)

    const created = await kvsClient.create({ id: 'shin', deviceId: 'ABCDEF', phoneType: 'Android' })
    console.log(created)
    const saved = await kvsClient.get(created.id)
    console.log(saved)

    await kvsClient.delete(created.id)
    console.log("deleted")
    const deleted = await kvsClient.get(created.id)
    console.log(deleted)
  })
})
