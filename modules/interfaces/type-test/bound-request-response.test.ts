import {
  ErrorResponseData,
  FindOneRequestData,
  FindRequestData,
  GeneralTypeMap,
  RequestData,
  RequestDataWithTypeMap,
  RequestMethodName,
  ResponseData,
  ResponseDataWithTypeMap
} from "../src";
import { IsExtends, TypeEq, assertNotType, assertType } from "./helpers";

import { SampleTypeMap } from "./helpers/sample-type-map";

/**
 * Tests for RequestDataTypeMap.
 */
{
  /**
   * It accepts type when
   *  its method is "insertAndGet" and
   *  its entityName is "message"
   *  its value is pre entity(entity without id) of "message"
   */
  {
    type InsertAndGetRequest = {
      method: "insertAndGet";
      payload: {
        entityName: "message";
        value: { body: string };
      };
    };

    assertType<
      IsExtends<
        InsertAndGetRequest,
        RequestDataWithTypeMap<
          SampleTypeMap,
          "insertAndGet",
          "message",
          any,
          any,
          any
        >
      >
    >();
  }

  /**
   * It doesn't accept type when
   *  its method is "insertAndGet" and
   *  its entityName is "message"
   *  its value is NOT pre entity(entity without id) of "message"
   */
  {
    type InsertAndGetRequest = {
      method: "insertAndGet";
      payload: {
        entityName: "message";
        value: { name: string };
      };
    };

    assertNotType<
      IsExtends<
        InsertAndGetRequest,
        RequestDataWithTypeMap<
          SampleTypeMap,
          "insertAndGet",
          "message",
          any,
          any,
          any
        >
      >
    >();
  }
}

/**
 * Tests for compatibility with RequestData and ResponseData.
 */
{
  /**
   * "find" RequestDataWithTypeMap
   *  and
   * FindRequestData
   *  are identical.
   */
  {
    type FindReqDataWithGeneralTypeMap = RequestDataWithTypeMap<
      GeneralTypeMap,
      "find",
      string,
      string,
      string,
      string
    >;
    assertType<
      TypeEq<FindReqDataWithGeneralTypeMap, FindRequestData<string>>
    >();
  }

  /**
   * "findOne" RequestDataWithTypeMap
   *  and
   * FindOneRequestData
   *  are identical.
   */
  {
    type FindOneReqDataWithGeneralTypeMap = RequestDataWithTypeMap<
      GeneralTypeMap,
      "findOne",
      string,
      string,
      string,
      string
    >;
    assertType<
      TypeEq<FindOneReqDataWithGeneralTypeMap, FindOneRequestData<string>>
    >();
  }

  /**
   * RequestDataWithTypeMap with GeneralTypeMap
   *  and
   * RequestData
   *  are identical.
   */
  {
    type RequestDataWithGeneralTypeMap = RequestDataWithTypeMap<
      GeneralTypeMap,
      RequestMethodName,
      string,
      string,
      string,
      string
    >;
    assertType<TypeEq<RequestDataWithGeneralTypeMap, RequestData>>();
  }

  /**
   * ResponseDataWithTypeMap with GeneralTypeMap
   *  and
   * ResponseData
   *  are identical.
   */
  {
    type ResponseDataWithGeneralTypeMap = ResponseDataWithTypeMap<
      GeneralTypeMap,
      RequestMethodName,
      string,
      string,
      string,
      string
    >;
    assertType<
      TypeEq<ResponseDataWithGeneralTypeMap | ErrorResponseData, ResponseData>
    >();
  }
}
