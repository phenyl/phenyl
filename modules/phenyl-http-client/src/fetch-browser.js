// @flow
// $FlowIssue(fetch-maybe-globally-assigned)
const fetch = typeof fetch === 'undefined' ? require('whatwg-fetch') : fetch
export default fetch
