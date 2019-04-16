/* global phenylApiExplorerClientGlobals */
import PhenylHttpClient from 'phenyl-http-client'

const { phenylApiUrlBase } = phenylApiExplorerClientGlobals

// singleton
let client = null

export default function getPhenylHttpClient() {
  if (client) {
    client = new PhenylHttpClient({ url: phenylApiUrlBase || window.location.origin })
  }
  return client
}
