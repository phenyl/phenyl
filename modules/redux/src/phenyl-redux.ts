import {
  AuthCommandMapOf,
  LocalState,
  GeneralAction,
  GeneralTypeMap,
  EntityRestInfoMapOf
} from "@phenyl/interfaces";
import { Middleware, Dispatch } from "redux";
import { MiddlewareCreator, MiddlewareOptions } from "./middleware";
import { PhenylReduxModule } from "./phenyl-redux-module";

export class PhenylRedux<TM extends GeneralTypeMap> {
  createMiddleware<T, S>(
    options: MiddlewareOptions<TM>
  ): Middleware<S, Dispatch<GeneralAction>> {
    const MC = MiddlewareCreator;
    return MC.create(options);
  }
  get reducer(): <
    RREM extends EntityRestInfoMapOf<TM>,
    ACM extends AuthCommandMapOf<TM>
  >(
    state: LocalState<RREM, ACM> | undefined | null,
    action: GeneralAction
  ) => LocalState<RREM, ACM> {
    return PhenylReduxModule.phenylReducer.bind(PhenylReduxModule);
  }
  get actions(): PhenylReduxModule {
    return PhenylReduxModule;
  }
}
