import { compose, combineReducers, createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import persistState from 'redux-localstorage'
import { reducer as operation } from './operation'
import { reducer as user, User } from './user'

export type State = {
  user: User,
}

export const reducers = combineReducers({
  operation,
  user,
})

const enhancer = compose(
  applyMiddleware(
    thunkMiddleware
  ),
  persistState(['user'])
)

export default createStore(reducers, enhancer)
