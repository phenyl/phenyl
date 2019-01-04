import {
  AuthEntityNameOf,
  CustomCommandNameOf,
  CustomCommandResult,
  CustomQueryNameOf,
  CustomQueryResult,
  EntityNameOf,
  GeneralTypeMap,
  GetCommandResult,
  HandlerResult,
  LoginCommandResult,
  PushCommandResult,
  QueryResult,
  RequestDataWithTypeMap,
  RequestMethodName,
  ResponseDataWithTypeMap,
  RestApiHandler
} from "../src";
import { TypeEq, assertNotType, assertType } from "./helpers";

import { SampleTypeMap } from "./helpers/sample-type-map";

/**
 * Tests for arguments and return values of
 *  RestApiHandler#handleRequestData().
 */
{
  /**
   * ApiHandler is a class implementing RestApiHandler.
   */
  class ApiHandler<TM extends GeneralTypeMap = GeneralTypeMap>
    implements RestApiHandler<TM> {
    handleRequestData<
      EN extends EntityNameOf<TM>,
      MN extends RequestMethodName,
      QN extends CustomQueryNameOf<TM>,
      CN extends CustomCommandNameOf<TM>,
      AN extends AuthEntityNameOf<TM>
    >(
      reqData: RequestDataWithTypeMap<TM, MN, EN, QN, CN, AN>
    ): HandlerResult<ResponseDataWithTypeMap<TM, MN, EN, QN, CN, AN>> {
      // @ts-ignore
      return reqData;
    }
  }
  const apiHandler = new ApiHandler<SampleTypeMap>();

  /**
   * It returns
   *   responseData
   *     whose type is "find" and
   *     whose payload is QueryResult of "member" entity
   *   when
   *   requestData
   *     whose method is "find" and
   *     whose payload.entityName is "member"
   *   is given.
   */
  {
    const response = apiHandler.handleRequestData({
      method: "find",
      payload: {
        entityName: "member",
        where: {}
      }
    });
    type ExpectedResponseData = {
      type: "find";
      payload: QueryResult<{ id: string; name: string }>;
    };
    assertType<TypeEq<typeof response, HandlerResult<ExpectedResponseData>>>();
  }

  /**
   * It doesn't return
   *   responseData
   *     whose payload is QueryResult of "message"(not "member") entity
   *   when
   *   requestData
   *     whose method is "find" and
   *     whose payload.entityName is "member"
   *   is given.
   */
  {
    const response = apiHandler.handleRequestData({
      method: "find",
      payload: {
        entityName: "member",
        where: {}
      }
    });
    type ExpectedResponseData = {
      type: "find";
      payload: QueryResult<{ id: string; body: string }>;
    };
    assertNotType<
      TypeEq<typeof response, HandlerResult<ExpectedResponseData>>
    >();
  }

  /**
   * It returns
   *   responseData
   *     whose type is "insertAndGet" and
   *     whose payload is GetCommandResult of "member" entity
   *   when
   *   requestData
   *     whose method is "insertAndGet" and
   *     whose payload.entityName is "member"
   *   is given.
   */
  {
    const response = apiHandler.handleRequestData({
      method: "insertAndGet",
      payload: {
        entityName: "member",
        value: { name: "John" }
      }
    });
    type ExpectedResponseData = {
      type: "insertAndGet";
      payload: GetCommandResult<{ id: string; name: string }>;
    };
    assertType<TypeEq<typeof response, HandlerResult<ExpectedResponseData>>>();
  }

  /**
   * It doesn't return
   *   responseData
   *     whose payload is GetCommandResult of "message"(not "member") entity
   *   when
   *   requestData
   *     whose method is "insertAndGet" and
   *     whose payload.entityName is "member"
   *   is given.
   */
  {
    const response = apiHandler.handleRequestData({
      method: "insertAndGet",
      payload: {
        entityName: "member",
        value: { name: "John" }
      }
    });
    type ExpectedResponseData = {
      type: "insertAndGet";
      payload: GetCommandResult<{ id: string; body: string }>;
    };
    assertNotType<
      TypeEq<typeof response, HandlerResult<ExpectedResponseData>>
    >();
  }

  /**
   * It returns
   *   responseData
   *     whose type is "push" and
   *     whose payload is PushCommandResult of "member" entity
   *   when
   *   requestData
   *     whose method is "push" and
   *     whose payload.entityName is "member"
   *   is given.
   */
  {
    const response = apiHandler.handleRequestData({
      method: "push",
      payload: {
        entityName: "member",
        id: "foo",
        operations: [{ $set: { name: "John" } }],
        versionId: "bar"
      }
    });
    type ExpectedResponseData = {
      type: "push";
      payload: PushCommandResult<{ id: string; name: string }>;
    };
    assertType<TypeEq<typeof response, HandlerResult<ExpectedResponseData>>>();
  }

  /**
   * It doens't return
   *   responseData
   *     whose payload is PushCommandResult of "message"(not "member") entity
   *   when
   *   requestData
   *     whose method is "push" and
   *     whose payload.entityName is "member"
   *   is given.
   */
  {
    const response = apiHandler.handleRequestData({
      method: "push",
      payload: {
        entityName: "member",
        id: "foo",
        operations: [{ $set: { name: "John" } }],
        versionId: "bar"
      }
    });
    type ExpectedResponseData = {
      type: "push";
      payload: PushCommandResult<{ id: string; body: string }>;
    };
    assertNotType<
      TypeEq<typeof response, HandlerResult<ExpectedResponseData>>
    >();
  }

  /**
   * It returns
   *   responseData
   *     whose type is "runCustomQuery" and
   *     whose payload is CustomQueryResult of "countMessagesOfMember"
   *   when
   *   requestData
   *     whose method is "runCustomQuery" and
   *     whose payload.name is "countMessagesOfMember"
   *   is given.
   */
  {
    const response = apiHandler.handleRequestData({
      method: "runCustomQuery",
      payload: {
        name: "countMessagesOfMember",
        params: { memberId: "foo" }
      }
    });
    type ExpectedResponseData = {
      type: "runCustomQuery";
      payload: CustomQueryResult<{ count: number }>;
    };
    assertType<TypeEq<typeof response, HandlerResult<ExpectedResponseData>>>();
  }

  /**
   * It doesn't return
   *   responseData
   *     whose payload is CustomQueryResult of "countMessagesOfMember"(not "getCurrentVersion")
   *   when
   *   requestData
   *     whose method is "runCustomQuery" and
   *     whose payload.name is "getCurrentVersion"
   *   is given.
   */
  {
    const response = apiHandler.handleRequestData({
      method: "runCustomQuery",
      payload: {
        name: "getCurrentVersion",
        params: {}
      }
    });
    type ExpectedResponseData = {
      type: "runCustomQuery";
      payload: CustomQueryResult<{ count: number }>;
    };
    assertNotType<
      TypeEq<typeof response, HandlerResult<ExpectedResponseData>>
    >();
  }

  /**
   * It returns
   *   responseData
   *     whose type is "runCustomCommand" and
   *     whose payload is CustomCommandResult of "register"
   *   when
   *   requestData
   *     whose method is "runCustomCommand" and
   *     whose payload.name is "register"
   *   is given.
   */
  {
    const response = apiHandler.handleRequestData({
      method: "runCustomCommand",
      payload: {
        name: "register",
        params: { name: "John" }
      }
    });
    type ExpectedResponseData = {
      type: "runCustomCommand";
      payload: CustomCommandResult<{ ok: 1 }>;
    };
    assertType<TypeEq<typeof response, HandlerResult<ExpectedResponseData>>>();
  }

  /**
   * It doesn't returns
   *   responseData
   *     whose payload isn't CustomCommandResult of "register"
   *   when
   *   requestData
   *     whose method is "runCustomCommand" and
   *     whose payload.name is "register"
   *   is given.
   */
  {
    const response = apiHandler.handleRequestData({
      method: "runCustomCommand",
      payload: {
        name: "register",
        params: { name: "John" }
      }
    });
    type ExpectedResponseData = {
      type: "runCustomCommand";
      payload: CustomCommandResult<{ ng: 1 }>;
    };
    assertNotType<
      TypeEq<typeof response, HandlerResult<ExpectedResponseData>>
    >();
  }

  /**
   * It returns
   *   responseData
   *     whose payload isn't CustomCommandResult of "register"
   *   when
   *   requestData
   *     whose method is "runCustomCommand" and
   *     whose payload.name is "register"
   *   is given.
   */
  {
    const response = apiHandler.handleRequestData({
      method: "login",
      payload: {
        entityName: "member",
        credentials: { email: "foo@example.com", password: "foo-bar" }
      }
    });
    type ExpectedResponseData = {
      type: "login";
      payload: LoginCommandResult<{ id: string; name: string }>;
    };
    assertType<TypeEq<typeof response, HandlerResult<ExpectedResponseData>>>();
  }
}
