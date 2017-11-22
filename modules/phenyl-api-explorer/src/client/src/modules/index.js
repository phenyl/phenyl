import { combineReducers, createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { reducer as operation } from './operation'
import { reducer as functionalGroup } from './functionalGroup'
import { reducer as user } from './user'

export const reducers = combineReducers({
  operation,
  functionalGroup,
  user,
})

export default createStore(
  reducers,
  applyMiddleware(
    thunkMiddleware
  )
)
