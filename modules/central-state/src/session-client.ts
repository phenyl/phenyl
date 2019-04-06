import {
  DbClient,
  PreEntity,
  PreSession,
  Session,
  SessionClient
} from "@phenyl/interfaces";

import { timeStampWithRandomString } from "@phenyl/utils";

type Id = string;

// @TODO: make this type better
type PhenylSessionEntityMap = {
  _PhenylSession: Session;
};

/**
 *
 */
export class PhenylSessionClient implements SessionClient {
  dbClient: DbClient<PhenylSessionEntityMap>;

  constructor(dbClient: DbClient<PhenylSessionEntityMap>) {
    this.dbClient = dbClient;
  }

  /**
   *
   */
  async get(id: Id | null): Promise<Session | null> {
    if (id == null) {
      return null;
    }
    try {
      const session = await this.dbClient.get({
        entityName: "_PhenylSession",
        id
      });
      if (new Date(session.expiredAt).getTime() <= Date.now()) {
        this.delete(id); // Run asynchronously
        return null;
      }
      return session;
    } catch (e) {
      // TODO: Check error message.
      return null;
    }
  }

  /**
   *
   */
  async create(preSession: PreSession): Promise<Session> {
    let value = preSession;
    if (value.id == null) {
      value = Object.assign({}, value, { id: timeStampWithRandomString() });
    }
    return this.set(value);
  }

  /**
   *
   */
  async set(value: PreEntity<Session>): Promise<Session> {
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
