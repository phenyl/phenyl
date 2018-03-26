// @flow
import type {
  AuthCommandMapOf,
  EntityMapOf,
  LocalState,
  PhenylAction,
  TypeMap,
} from 'phenyl-interfaces'
import type { Middleware } from 'redux'
import { MiddlewareCreator, type MiddlewareOptions, type Next, type PhenylActionOf } from './middleware.js'
import { PhenylReduxModule } from './phenyl-redux-module.js'

export class PhenylRedux<TM: TypeMap> {

  createMiddleware<T, S>(options: MiddlewareOptions<TM>): Middleware<S, PhenylActionOf<TM>, Next<TM, T>> {
    const MC: Class<MiddlewareCreator<TM>> = MiddlewareCreator
    return MC.create(options)
  }

  get reducer(): ((?LocalState<EntityMapOf<TM>>, PhenylAction<EntityMapOf<TM>, AuthCommandMapOf<TM>>) => LocalState<EntityMapOf<TM>>) {
    return PhenylReduxModule.phenylReducer
  }

  get actions(): Class<PhenylReduxModule<TM>> {
    return PhenylReduxModule
  }
}
