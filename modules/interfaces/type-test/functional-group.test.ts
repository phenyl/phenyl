/* eslint-disable @typescript-eslint/no-unused-vars */
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
  UserDefinition
} from "../src";
import { IsExtends, TypeEq, assertType } from "./helpers";

/**
 * Tests for `TypeMapFromFG`.
 */
{
  type MemberResponse = { id: string; name: string; age: number };
  type MemberRequest = { id: string; name: string };
  type Credentials = { email: string; password: string };
  type MemberSessionValue = { externalId: string; ttl: number };

  class MemberDefinition implements UserDefinition {
    async authenticate(loginCommand: LoginCommand<"member", Credentials>) {
      const { entityName, credentials } = loginCommand;

      const ret = {
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

  /**
   * Tests for `TypeMapFromFG` withSpecificAuthentication
   */
  {
    type MemberResponse = { id: string; name: string; age: number };
    type MemberRequest = { id: string; name: string };
    type Credentials = { email: string; password: string };
    type MemberSessionValue = { externalId: string; ttl: number };

    class MemberDefinitionWithResultType implements UserDefinition {
      async authenticate(loginCommand: LoginCommand<"member", Credentials>) {
        const { entityName, credentials } = loginCommand;

        const ret: AuthenticationResult<
          "member",
          MemberResponse,
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

    type MessageResponse = { id: string; body: string; createdAt: string };
    type MessageRequest = { id: string; body: string };
    class MessageDefinition implements EntityDefinition {}

    type MedicalRecord = { id: string; body: string; createdAt: string };
    type N = "medicalRecord";
    type E = MedicalRecord;

    class MedicalRecordDefinition implements EntityDefinition {
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
  }
}
