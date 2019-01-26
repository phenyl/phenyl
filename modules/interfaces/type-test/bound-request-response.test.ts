import {
  ErrorResponseData,
  FindOneRequestData,
  FindRequestData,
  GeneralRequestData,
  GeneralResponseData,
  GeneralTypeMap,
  RequestDataWithTypeMap,
  RequestDataWithTypeMapForResponse,
  RequestMethodName,
  ResponseDataWithTypeMap
} from "../src";
import { IsExtends, TypeEq, assertNotType, assertType } from "./helpers";

import { SampleTypeMap } from "./helpers/sample-type-map";

/**
 * Tests for RequestDataTypeMapForResponse.
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
        RequestDataWithTypeMapForResponse<
          SampleTypeMap,
          "insertAndGet",
          "message"
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
        RequestDataWithTypeMapForResponse<
          SampleTypeMap,
          "insertAndGet",
          "message"
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
   * "find" RequestDataWithTypeMapForResponse
   *  and
   * FindRequestData
   *  are identical.
   */
  {
    type FindReqDataWithGeneralTypeMap = RequestDataWithTypeMapForResponse<
      GeneralTypeMap,
      "find",
      string
    >;
    assertType<
      TypeEq<FindReqDataWithGeneralTypeMap, FindRequestData<string>>
    >();
  }

  /**
   * "findOne" RequestDataWithTypeMapForResponse
   *  and
   * FindOneRequestData
   *  are identical.
   */
  {
    type FindOneReqDataWithGeneralTypeMap = RequestDataWithTypeMapForResponse<
      GeneralTypeMap,
      "findOne",
      string
    >;
    assertType<
      TypeEq<FindOneReqDataWithGeneralTypeMap, FindOneRequestData<string>>
    >();
  }

  /**
   * RequestDataWithTypeMapForResponse with GeneralTypeMap
   *  and
   * RequestData
   *  are identical.
   */
  {
    type RequestDataWithGeneralTypeMap = RequestDataWithTypeMapForResponse<
      GeneralTypeMap,
      RequestMethodName,
      string
    >;
    assertType<TypeEq<RequestDataWithGeneralTypeMap, GeneralRequestData>>();
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
      string,
      string,
      string,
      string
    >;
    assertType<TypeEq<RequestDataWithGeneralTypeMap, GeneralRequestData>>();
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
      string
    >;
    assertType<
      TypeEq<
        ResponseDataWithGeneralTypeMap | ErrorResponseData,
        GeneralResponseData
      >
    >();
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
      string
    >;
    
    assertType<
      TypeEq<
        ResponseDataWithGeneralTypeMap | ErrorResponseData,
        GeneralResponseData
      >
    >();
  }
}
