import { compose, combineReducers, createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import persistState from 'redux-localstorage'
import { reducer as operation } from './operation'
import { reducer as functionalGroup } from './functionalGroup'
import { reducer as user } from './user'

export const reducers = combineReducers({
  operation,
  functionalGroup,
  user,
})

const enhancer = compose(
  applyMiddleware(
    thunkMiddleware
  ),
  persistState(['user'])
)

export default createStore(reducers, enhancer)
