// @flow
import { actions } from './phenyl-redux-module.js'

export function mapStateToProps(dispatch: Function) {
  const ret = {}
  Object.keys(actions).forEach(methodName => {
    ret[methodName] = (...args) => {
      const action = actions[methodName](...args)
      dispatch(action)
      return action.tag
    }
  })
  return ret
}
