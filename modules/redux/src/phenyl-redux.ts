import {
  LocalStateOf,
  GeneralTypeMap,
  ActionWithTypeMap,
  EntityNameOf,
  UserEntityNameOf
} from "@phenyl/interfaces";
import { Middleware } from "redux";
import { MiddlewareCreator, MiddlewareOptions } from "./middleware";
import { PhenylReduxModule } from "./phenyl-redux-module";

export class PhenylRedux<TM extends GeneralTypeMap> {
  createMiddleware(options: MiddlewareOptions<TM>): Middleware {
    return MiddlewareCreator.create(options);
  }

  get reducer(): <EN extends EntityNameOf<TM>, UN extends UserEntityNameOf<TM>>(
    state: LocalStateOf<TM> | undefined | null,
    action: ActionWithTypeMap<TM, EN, UN>
  ) => LocalStateOf<TM> {
    return PhenylReduxModule.phenylReducer.bind(PhenylReduxModule);
  }

  get actions(): PhenylReduxModule {
    return PhenylReduxModule;
  }
}
