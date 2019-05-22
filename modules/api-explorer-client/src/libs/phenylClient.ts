import PhenylHttpClient from "@phenyl/http-client";

const { phenylApiUrlBase } = window.phenylApiExplorerClientGlobals;

let client: PhenylHttpClient<any> | null = null;

// Singleton PhenylHttpClient
export default function getPhenylHttpClient() {
  if (!client) {
    client = new PhenylHttpClient({
      url: phenylApiUrlBase || window.location.origin
    });
  }
  return client;
}
