// @flow

/**
 * This is the tricky workaround for Metro bundler (used in React Native).
 * As Metro bundler doesn't see "browser" field in package.json, which otherwise switch the file from "fetch.js"
 * to "fetch-browser.js" when "fetch.js" is required. Then, Metro bundler parses this file and try to bundle
 * "node-fetch", which is intended to run only on Node.js. Metro bundler is wise enough to see the strings passed to
 * require function. For Metro bundler not to follow the module name, generating the string programatically like
 * `join('-')` is needed.
 */
const moduleName = ['node', 'fetch'].join('-')

// $FlowIssue(fetch-maybe-globally-assigned)
export default typeof fetch === 'undefined' ? require(moduleName) : fetch
