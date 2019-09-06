import { update } from "sp2";
import {
  GeneralTypeMap,
  EntityRestInfoMapOf,
  LocalEntityState,
  LocalStateOf,
  ActionWithTypeMap,
  EntityNameOf,
  UserEntityNameOf
} from "@phenyl/interfaces";

export type PhenylReducerFunction<TM extends GeneralTypeMap> = <
  EN extends EntityNameOf<TM>,
  UN extends UserEntityNameOf<TM>
>(
  state: LocalStateOf<TM> | undefined | null,
  action: ActionWithTypeMap<TM, EN, UN>
) => LocalStateOf<TM>;

export function createInitialState<TM extends GeneralTypeMap>(): LocalStateOf<
  TM
> {
  return {
    entities: {} as LocalEntityState<EntityRestInfoMapOf<TM>>,
    unreachedCommits: [],
    network: {
      requests: [],
      isOnline: true
    }
  };
}

export function createReducer<
  TM extends GeneralTypeMap
>(): PhenylReducerFunction<TM> {
  return function reducer<
    EN extends EntityNameOf<TM>,
    UN extends UserEntityNameOf<TM>
  >(
    state: LocalStateOf<TM> | undefined | null,
    action: ActionWithTypeMap<TM, EN, UN>
  ): LocalStateOf<TM> {
    if (state == null) {
      return createInitialState();
    }

    switch (action.type) {
      case "phenyl/replace":
        return {
          ...state,
          ...action.payload
        };

      case "phenyl/reset":
        return createInitialState();

      case "phenyl/assign":
        return update(state, ...action.payload) as LocalStateOf<TM>;

      default:
        return state;
    }
  };
}

export const reducer = createReducer();
