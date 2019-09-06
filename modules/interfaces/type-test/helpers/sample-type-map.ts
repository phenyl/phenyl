import { GeneralTypeMap } from "../../src";

export interface SampleTypeMap extends GeneralTypeMap {
  entities: {
    member: { type: { id: string; name: string } };
    message: {
      type: {
        id: string;
        body: string;
      };
    };
  };
  customQueries: {
    countMessagesOfMember: {
      params: { memberId: string };
      result: { count: number };
    };
    getCurrentVersion: {
      result: { version: string };
    };
  };
  customCommands: {
    register: { params: { name: string }; result: { ok: 1 } };
  };
  auths: {
    member: {
      credentials: { email: string; password: string };
      session: { externalId: string; ttl: number };
    };
  };
}
