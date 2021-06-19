import {
  DbClient,
  PreEntity,
  PreSession,
  Session,
  SessionClient,
  GeneralAuthCommandMap,
  AllSessions,
} from "@phenyl/interfaces";

import { timeStampWithRandomString } from "@phenyl/utils";

type Id = string;

// @TODO: make this type better
export type PhenylSessionEntityMap<S extends Session = Session> = {
  _PhenylSession: S;
};

/**
 *
 */
export class PhenylSessionClient<
  AM extends GeneralAuthCommandMap = GeneralAuthCommandMap
> implements SessionClient<AM> {
  dbClient: DbClient<PhenylSessionEntityMap<AllSessions<AM>>>;

  constructor(dbClient: DbClient<PhenylSessionEntityMap>) {
    // @ts-ignore  Type 'string' is not assignable to type 'Extract<keyof AM, string>'.
    this.dbClient = dbClient;
  }

  /**
   *
   */
  async get(id?: Id): Promise<AllSessions<AM> | undefined> {
    if (id === undefined || id === null) {
      return;
    }
    try {
      const session = await this.dbClient.get({
        entityName: "_PhenylSession",
        id,
      });
      if (new Date(session.expiredAt).getTime() <= Date.now()) {
        this.delete(id); // Run asynchronously
        return;
      }
      return session;
    } catch (e) {
      // TODO: Check error message.
      return;
    }
  }

  /**
   *
   */
  async create<EN extends string = string>(
    preSession: PreSession<EN, AllSessions<AM>>
  ): Promise<AllSessions<AM>> {
    let value = preSession;
    if (value.id == null) {
      value = Object.assign({}, value, { id: timeStampWithRandomString() });
    }
    return this.set(value);
  }

  /**
   *
   */
  async set(value: PreEntity<AllSessions<AM>>): Promise<AllSessions<AM>> {
    return this.dbClient.insertAndGet({ entityName: "_PhenylSession", value });
  }

  /**
   *
   */
  async delete(id: Id | null | undefined): Promise<boolean> {
    if (id == null) {
      return false;
    }
    await this.dbClient.delete({ entityName: "_PhenylSession", id });
    return true;
  }
}
