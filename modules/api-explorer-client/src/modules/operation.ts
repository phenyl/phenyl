// @ts-ignore remove this comment after phenyl/http-client release
import PhenylHttpClient from "phenyl-http-client";
import { PhenylError } from "@phenyl/interfaces";
import { ThunkDispatch } from "redux-thunk";

const EXECUTE_START = "operation/EXECUTE_START";
const EXECUTE_FINISHED = "operation/EXECUTE_FINISHED";
const EXECUTE_FAILED = "operation/EXECUTE_FAILED";

const initialState = {
  isFetching: false,
  spent: -1,
  response: null, // FIXME
  error: null
};

// @TODO: implement response/error type
export type Operation = {
  isFetching: boolean;
  spent: number;
  response: any;
  error: any;
};

type Action = {
  type: string;
  spent: number;
  response: any;
  error: any;
};

export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case EXECUTE_START:
      return {
        ...state,
        ...initialState,
        isFetching: true
      };
    case EXECUTE_FINISHED:
      return {
        ...state,
        isFetching: false,
        spent: action.spent,
        response: action.response
      };
    case EXECUTE_FAILED:
      return {
        ...state,
        isFetching: false,
        spent: action.spent,
        error: action.error
      };
    default:
      return state;
  }
};

export const startExecute = () => ({
  type: EXECUTE_START
});

export const receiveResponse = (response: any, spent: number) => ({
  type: EXECUTE_FINISHED,
  spent,
  response
});

export const receiveErrorResponse = (error: PhenylError<any>, spent: number) => ({
  type: EXECUTE_FAILED,
  spent,
  error
});

export const execute = (params: {
  sessionId: string;
  entityName: string;
  method: string;
  payload: string;
  // @TODO: define those any typs
}) => async (dispatch: ThunkDispatch<any, any, any>) => {
  const { sessionId, entityName, method, payload } = params;
  const client = new PhenylHttpClient({ url: window.location.origin });
  dispatch(startExecute());

  const start = new Date();
  let response = null;
  try {
    const payloadJSON = JSON.parse(payload);
    switch (method) {
      case "find":
        response = await client.find({ entityName, ...payloadJSON }, sessionId);
        break;

      case "findOne":
        response = await client.findOne(
          { entityName, ...payloadJSON },
          sessionId
        );
        break;

      case "get":
        response = await client.get({ entityName, ...payloadJSON }, sessionId);
        break;

      case "getByIds":
        response = await client.getByIds(
          { entityName, ...payloadJSON },
          sessionId
        );
        break;

      case "pull":
        response = await client.pull({ entityName, ...payloadJSON }, sessionId);
        break;

      case "insertOne":
        response = await client.insertOne(
          { entityName, ...payloadJSON },
          sessionId
        );
        break;

      case "insertAndGet":
        response = await client.insertAndGet(
          { entityName, ...payloadJSON },
          sessionId
        );
        break;

      case "insertAndGetMulti":
        response = await client.insertAndGetMulti(
          { entityName, ...payloadJSON },
          sessionId
        );
        break;

      case "updateById":
        response = await client.updateById(
          { entityName, ...payloadJSON },
          sessionId
        );
        break;

      case "updateAndGet":
        response = await client.updateAndGet(
          { entityName, ...payloadJSON },
          sessionId
        );
        break;

      case "updateMulti":
        response = await client.updateMulti(
          { entityName, ...payloadJSON },
          sessionId
        );
        break;

      case "updateAndFetch":
        response = await client.updateAndFetch(
          { entityName, ...payloadJSON },
          sessionId
        );
        break;

      case "push":
        response = await client.push({ entityName, ...payloadJSON }, sessionId);
        break;

      case "delete":
        response = await client.delete(
          { entityName, ...payloadJSON },
          sessionId
        );
        break;

      case "login":
        response = await client.login(
          { entityName, ...payloadJSON },
          sessionId
        );
        break;

      case "logout":
        response = await client.logout(
          { entityName, ...payloadJSON },
          sessionId
        );
        break;

      default:
        throw new Error(`Unknown method: ${method}`);
    }

    // https://github.com/Microsoft/TypeScript/issues/5710
    dispatch(receiveResponse(response, +new Date() - +start));
  } catch (e) {
    dispatch(receiveErrorResponse(e, +new Date() - +start));
  }
};

export const runCustomQuery = ({
  sessionId,
  name,
  params
}: {
  sessionId: string;
  name: string;
  params: string;
  // @TODO: define those any typs
}) => async (dispatch: ThunkDispatch<any, any, any>) => {
  const client = new PhenylHttpClient({ url: window.location.origin });
  dispatch(startExecute());

  const start = new Date();
  try {
    const paramsJSON = JSON.parse(params);
    const response = await client.runCustomQuery(
      { name, paramsJSON },
      sessionId
    );
    // https://github.com/Microsoft/TypeScript/issues/5710
    dispatch(receiveResponse(response, +new Date() - +start));
  } catch (e) {
    dispatch(receiveErrorResponse(e, +new Date() - +start));
  }
};

export const runCustomCommand = ({
  sessionId,
  name,
  params
}: {
  sessionId: string;
  name: string;
  params: string;
  // @TODO: define those any typs
}) => async (dispatch: ThunkDispatch<any, any, any>) => {
  const client = new PhenylHttpClient({ url: window.location.origin });
  dispatch(startExecute());

  const start = new Date();
  try {
    const paramsJSON = JSON.parse(params);
    const response = await client.runCustomCommand(
      { name, paramsJSON },
      sessionId
    );
    // https://github.com/Microsoft/TypeScript/issues/5710
    dispatch(receiveResponse(response, +new Date() - +start));
  } catch (e) {
    dispatch(receiveErrorResponse(e, +new Date() - +start));
  }
};
