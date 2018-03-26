// @flow
import { PhenylRedux } from './phenyl-redux.js'
import phenylReducer, { actions } from './phenyl-redux-module.js'
import { MiddlewareCreator, createMiddleware } from './middleware.js'
export { PhenylRedux, actions, createMiddleware, MiddlewareCreator }
export default phenylReducer
