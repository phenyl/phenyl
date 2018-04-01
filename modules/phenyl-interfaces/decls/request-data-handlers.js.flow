// @flow
import type {
  RequestData
} from './request-data.js.flow'
import type {
  WhereQuery,
  IdQuery,
  IdsQuery,
  CustomQuery,
  PullQuery,
} from './query.js.flow'

import type {
  SingleInsertCommand,
  MultiInsertCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  DeleteCommand,
  CustomCommand,
  LogoutCommand,
  PushCommand,
} from './command.js.flow'

import type {
  TypeMap,
  AuthSettingOf,
  LoginCommandOf,
  EntityNameOf,
  UserEntityNameOf,
  CustomQueryNameOf,
  CustomCommandNameOf,
} from './type-map.js.flow'

export type RequestDataHandlers<TM: TypeMap, T> = {
  handleDefault: (reqData: RequestData) => Promise<T>,

  find?: <N: EntityNameOf<TM>>(query: WhereQuery<N>) => Promise<T>,
  findOne?: <N: EntityNameOf<TM>>(query: WhereQuery<N>) => Promise<T>,
  get?: <N: EntityNameOf<TM>>(query: IdQuery<N>) => Promise<T>,
  getByIds?: <N: EntityNameOf<TM>>(query: IdsQuery<N>) => Promise<T>,
  pull?: <N: EntityNameOf<TM>>(query: PullQuery<N>) => Promise<T>,
  insertOne?: <N: EntityNameOf<TM>>(command: SingleInsertCommand<N>) => Promise<T>,
  insertMulti?: <N: EntityNameOf<TM>>(command: MultiInsertCommand<N>) => Promise<T>,
  insertAndGet?: <N: EntityNameOf<TM>>(command: SingleInsertCommand<N>) => Promise<T>,
  insertAndGetMulti?: <N: EntityNameOf<TM>>(command: MultiInsertCommand<N>) => Promise<T>,
  updateById?: <N: EntityNameOf<TM>>(command: IdUpdateCommand<N>) => Promise<T>,
  updateMulti?: <N: EntityNameOf<TM>>(command: MultiUpdateCommand<N>) => Promise<T>,
  updateAndGet?: <N: EntityNameOf<TM>>(command: IdUpdateCommand<N>) => Promise<T>,
  updateAndFetch?: <N: EntityNameOf<TM>>(command: MultiUpdateCommand<N>) => Promise<T>,
  push?: <N: EntityNameOf<TM>>(command: PushCommand<N>) => Promise<T>,
  delete?: <N: EntityNameOf<TM>>(command: DeleteCommand<N>) => Promise<T>,
  runCustomQuery?: <N: CustomQueryNameOf<TM>>(query: CustomQuery<N>) => Promise<T>,
  runCustomCommand?: <N: CustomCommandNameOf<TM>>(command: CustomCommand<N>) => Promise<T>,
  login?: <N: UserEntityNameOf<TM>>(command: LoginCommandOf<AuthSettingOf<TM, N>, N>) => Promise<T>,
  logout?: <N: UserEntityNameOf<TM>>(command: LogoutCommand<N>) => Promise<T>,

  notMatch?: (reqData: RequestData) => Promise<T>,
}
