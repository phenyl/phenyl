import {
  AuthCommandMapOf,
  LocalState,
  PhenylAction,
  GeneralTypeMap,
  ReqResEntityMapOf,
} from '@phenyl/interfaces'
import { Middleware, Dispatch } from 'redux'
import { MiddlewareCreator, MiddlewareOptions } from './middleware.js'
import { PhenylReduxModule } from './phenyl-redux-module.js'

export class PhenylRedux<TM extends GeneralTypeMap> {
  createMiddleware<T, S>(
    options: MiddlewareOptions<TM>,
  ): Middleware<S, Dispatch<PhenylAction>> {
    const MC = MiddlewareCreator
    return MC.create(options)
  }
  get reducer(): <
    RREM extends ReqResEntityMapOf<TM>,
    ACM extends AuthCommandMapOf<TM>
  >(
    action: PhenylAction,
    state?: LocalState<RREM, ACM>,
  ) => LocalState<RREM, ACM> {
    return PhenylReduxModule.phenylReducer.bind(PhenylReduxModule)
  }
  get actions(): PhenylReduxModule {
    return PhenylReduxModule
  }
}
