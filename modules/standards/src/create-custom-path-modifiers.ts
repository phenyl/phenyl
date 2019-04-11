import {
  ClientPathModifier,
  PathModifier,
} from '@phenyl/interfaces'

type PathModifiers = {
  modifyPathInClient: ClientPathModifier,
  modifyPathInServer: PathModifier,
}

type Options = {
  from?: string,
  to?: string,
}

/**
 * Create Path Modifiers(both ClientSide and ServerSide) of custom queries/commands.
 * By default, "_" in custom names are converted into "/".
 * For example, if custom name is "user_get-by-country", it's modified path will be "/apis/user/get-by-country".
 * This will be helpful when you create entityName-related custom queries/commands.
 *
 * Pass the custom names you want to convert to the 1st arguemnt.
 * The returned value will be used in server and client.
 *
 *   // In client
 *   const { modifyPathInClient } = createCustomPathModifiers(['user_get-by-country', 'user_register-by-code'])
 *   const client = new PhenylHttpClient({ url: 'http://example.com', modifyPath: modifyPathInClient })
 *
 *   // In server
 *   const { modifyPathInServer } = createCustomPathModifiers(['user_get-by-country', 'user_register-by-code'])
 *   const server = new PhenylHttpServer(http.createServer(), { restApiHandler: phenylCore, modifyPath: modifyPathInServer })
 *
 * As these returned functions are just plain functions, you can combine with other modifiers.
 *   // In client
 *   const { modifyPathInClient } = createCustomPathModifiers(['user_get-by-country', 'user_register-by-code'])
 *   const client = new PhenylHttpClient({ url: 'http://example.com', modifyPath: (path) => {
 *     const modifiedPath = modifyPathInClient(path)
 *     return `/foo/bar/${modifiedPath}`
 *   }})
 *
 */
export function createCustomPathModifiers(customNames: Array<string>, options: Options = {}): PathModifiers {
  const from = options.from || '_'
  const to = options.to || '/'
  const originalToModified: { [key: string]: string } = {};
  const modifiedToOriginal: { [key: string]: string } = {};
  customNames.forEach(customName => {
    const original = `/api/${customName}`
    const modified = `/api/${customName.split(from).join(to)}`
    originalToModified[original] = modified
    modifiedToOriginal[modified] = original
  })
  return {
    modifyPathInClient: (originalPath: string): string => {
      return originalToModified[originalPath] || originalPath
    },
    modifyPathInServer: (modifiedPath: string): string => {
      return modifiedToOriginal[modifiedPath] || modifiedPath
    },
  }
}
