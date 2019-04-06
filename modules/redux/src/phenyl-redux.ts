import { AuthCommandMapOf, EntityMapOf, LocalState, PhenylAction, TypeMap } from 'phenyl-interfaces'
import { Middleware } from 'redux'
import { MiddlewareCreator, MiddlewareOptions, Next, PhenylActionOf } from './middleware.js'
import { PhenylReduxModule } from './phenyl-redux-module.js'
export class PhenylRedux<TM extends TypeMap> {
  createMiddleware<T, S>(options: MiddlewareOptions<TM>): Middleware<S, PhenylActionOf<TM>, Next<TM, T>> {
    //    const MC: Class<MiddlewareCreator<TM>> = MiddlewareCreator;
    return MC.create(options)
  } //  get reducer(): ((?LocalState<EntityMapOf<TM>>, PhenylAction<EntityMapOf<TM>, AuthCommandMapOf<TM>>) => LocalState<EntityMapOf<TM>>) {
  //    return PhenylReduxModule.phenylReducer.bind(PhenylReduxModule)
  //  }
  //  get actions(): Class<PhenylReduxModule<TM>> {
  //    return PhenylReduxModule;
  //  }
}
