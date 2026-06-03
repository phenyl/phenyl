// Work around CommonJS import issue
const PhenylHttpClientModule = require("@phenyl/http-client");
const PhenylHttpClient = PhenylHttpClientModule.default || PhenylHttpClientModule;

const { phenylApiUrlBase } = window.phenylApiExplorerClientGlobals;

let client: any | null = null;

// Singleton PhenylHttpClient
export default function getPhenylHttpClient() {
  if (!client) {
    client = new PhenylHttpClient({
      url: phenylApiUrlBase || window.location.origin,
    });
  }
  return client;
}
