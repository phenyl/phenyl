import {
  AuthenticationResult,
  CustomCommand,
  CustomCommandDefinition,
  CustomQuery,
  CustomQueryDefinition,
  EntityDefinition,
  EntityRequestData,
  GeneralTypeMap,
  LoginCommand,
  TypeMapFromFunctionalGroup,
  TypeOnly,
  UserDefinition,
  ReqRes
} from "../src";
import { IsExtends, TypeEq, assertType } from "./helpers";

/**
 * Tests for `TypeMapFromFG`.
 */
{
  type NarrowMember = { id: string; name: string; age: number };
  type BroadMember = { id: string; name: string };
  type Credentials = { email: string; password: string };
  type MemberSessionValue = { externalId: string; ttl: number };

  class MemberDefinition implements UserDefinition {
    entityName: TypeOnly<"member">;
    entity: TypeOnly<ReqRes<BroadMember,NarrowMember>>;

    async authenticate(loginCommand: LoginCommand<"member", Credentials>) {
      const { entityName, credentials } = loginCommand;

      const ret: AuthenticationResult<
        "member",
        NarrowMember,
        MemberSessionValue
      > = {
        preSession: {
          entityName,
          expiredAt: "",
          userId: credentials.email,
          externalId: "",
          ttl: 12345
        },
        user: { id: "bar", name: "John", age: 23 },
        versionId: "foo"
      };
      return ret;
    }
  }

  type NarrowMessage = { id: string; body: string; createdAt: string };
  type BroadMessage = { id: string; body: string };
  class MessageDefinition implements EntityDefinition {
    entityName: TypeOnly<"message">;
    entity: TypeOnly<ReqRes<BroadMessage,NarrowMessage>>;
  }

  type MedicalRecord = { id: string; body: string; createdAt: string };
  type N = "medicalRecord";
  type E = MedicalRecord;

  class MedicalRecordDefinition implements EntityDefinition {
    entityName: TypeOnly<N>;
    entity: TypeOnly<ReqRes<E>>;

    async normalize(reqData: EntityRequestData<N, E>, session) {
      return reqData;
    }
  }

  type CountMessagesOfMemberParams = { memberId: string };
  type CountMessagesOfMemberResult = { count: number };
  class CountMessagesOfMemberDefinition implements CustomQueryDefinition {
    async execute(
      query: CustomQuery<"countMessagesOfMember", CountMessagesOfMemberParams>
    ) {
      return {
        result: { count: 3 } as CountMessagesOfMemberResult
      };
    }
  }

  type RegisterParams = { name: string };
  type RegisterResult = { ok: 1 };

  class RegisterDefinition implements CustomCommandDefinition {
    async execute(query: CustomCommand<"register", RegisterParams>) {
      return {
        result: { ok: 1 } as RegisterResult
      };
    }
  }

  const fg = {
    users: { member: new MemberDefinition() },
    nonUsers: {
      message: new MessageDefinition(),
      medicalRecord: new MedicalRecordDefinition()
    },
    customQueries: {
      countMessagesOfMember: new CountMessagesOfMemberDefinition()
    },
    customCommands: { register: new RegisterDefinition() }
  };

  type MyMap = TypeMapFromFunctionalGroup<typeof fg>;

  /**
   * `MyMap` is compatible with `GeneralTypeMap`.
   */
  {
    assertType<IsExtends<MyMap, GeneralTypeMap>>();
  }

  /**
   * `MyMap["entities"]` contains three entities.
   */
  {
    type MyEntities = MyMap["entities"];
    assertType<
      TypeEq<
        MyEntities,
        {
          member: { request: BroadMember, response: NarrowMember};
          message: { request:  BroadMessage, response: NarrowMessage};
          medicalRecord: { request: MedicalRecord, response: MedicalRecord};
        }
      >
    >();
  }

  /**
   * `MyMap["customQueries"]` contains CustomQuery params and result.
   */
  {
    type MyQueries = MyMap["customQueries"];
    assertType<
      TypeEq<
        MyQueries,
        {
          countMessagesOfMember: {
            params: CountMessagesOfMemberParams;
            result: CountMessagesOfMemberResult;
          };
        }
      >
    >();
  }

  /**
   * `MyMap["customCommands"]` contains CustomCommand params and result.
   */
  {
    type MyCommands = MyMap["customCommands"];
    assertType<
      TypeEq<
        MyCommands,
        {
          register: {
            params: RegisterParams;
            result: RegisterResult;
          };
        }
      >
    >();
  }

  /**
   * `MyMap["auths"]` contains auth credentials and session values.
   */
  {
    type MyAuths = MyMap["auths"];
    assertType<
      TypeEq<
        MyAuths,
        {
          member: {
            credentials: Credentials;
            session: MemberSessionValue;
          };
        }
      >
    >();
  }
}
