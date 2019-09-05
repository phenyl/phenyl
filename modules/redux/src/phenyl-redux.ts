import { GeneralTypeMap } from "@phenyl/interfaces";
import { createMiddleware, MiddlewareOptions } from "./middleware";
import { createReducer, PhenylReducerFunction } from "./reducer";
import { ActionCreator } from "./action-creator";

export function useRedux<TM extends GeneralTypeMap>(
  options: MiddlewareOptions<TM>
) {
  return {
    middleware: createMiddleware(options),
    reducer: createReducer<TM>(),
    actions: new ActionCreator<TM>()
  };
}

/**
 * Deprecated.
 * Use `useRedux()`
 */
export class PhenylRedux<TM extends GeneralTypeMap> {
  createMiddleware() {
    return createMiddleware;
  }
  get reducer(): PhenylReducerFunction<TM> {
    return createReducer<TM>();
  }
  get actions(): ActionCreator<TM> {
    return new ActionCreator<TM>();
  }
}
