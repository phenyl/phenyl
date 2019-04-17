import { PhenylRedux } from "./phenyl-redux";
import phenylReducer, { actions } from "./phenyl-redux-module";
import { MiddlewareCreator, createMiddleware } from "./middleware";
import { LocalStateFinder } from "./local-state-finder";
import { LocalStateUpdater } from "./local-state-updater";
export {
  PhenylRedux,
  actions,
  createMiddleware,
  MiddlewareCreator,
  LocalStateFinder,
  LocalStateUpdater
};
export default phenylReducer;
