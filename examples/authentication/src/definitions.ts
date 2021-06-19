import { StandardUserDefinition } from "@phenyl/standards";

export type ThisEntityMap = {
  user: {
    type: { id: string; name: string; email: string; password?: string };
  };
};

type PlainUser = {
  id: string;
  name: string;
  email: string;
  password?: string;
};
type UserAuthSetting = {
  credentials: { email: string; password: string };
  options: Object;
};

export type ThisTypeMap = {
  entities: ThisEntityMap;
  customQueries: {};
  customCommands: {};
  auths: {
    user: UserAuthSetting;
  };
};

export class UserDefinition extends StandardUserDefinition {
  constructor(entityClient) {
    super({
      entityClient,
      accountPropName: "email",
      passwordPropName: "password",
      ttl: 24 * 3600,
    });
  }
  async authorization(reqData, session): Promise<boolean> {
    if (
      ["insert", "insertAndGet", "insertAndFetch", "login", "logout"].includes(
        reqData.method
      )
    )
      return true;
    console.log(session, reqData.payload);
    if (["updateAndGet"].includes(reqData.method))
      return session != null && session.userId === reqData.payload.id;
    return false;
  }
}
