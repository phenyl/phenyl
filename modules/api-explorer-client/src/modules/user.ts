/* global PhenylFunctionalGroupSkeleton */
import PhenylHttpClient from "@phenyl/http-client";
import { ThunkDispatch } from "redux-thunk";
const LOGIN = "user/LOGIN";
const LOGIN_AS_ANONYMOUS = "user/LOGIN_AS_ANONYMOUS";
const LOGIN_REQUEST = "user/LOGIN_REQUEST";
const LOGIN_SUCCESS = "user/LOGIN_SUCCESS";
const LOGIN_FAILED = "user/LOGIN_FAILED";
const LOGOUT = "user/LOGOUT";

// @TODO: Should we add Credentials in phenyl/interfaces?
type Credentials = any;

// @TODO: define session/user/error type
export type User = {
  busy: boolean;
  displayName: string;
  session: any;
  anonymous: boolean;
  user: any;
  error: any;
};

const initialState = {
  busy: false,
  displayName: "",
  session: null,
  anonymous: false,
  user: null,
  error: null
};

// @TODO: define this any type
type Action = {
  type: string;
  session: any;
  user: any;
  error: any;
};

export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        anonymous: false,
        session: null,
        user: null,
        error: null
      };
    case LOGIN_AS_ANONYMOUS:
      return {
        ...state,
        busy: false,
        anonymous: true,
        session: null,
        user: null,
        error: null
      };
    case LOGIN_REQUEST:
      return {
        ...state,
        busy: true
      };
    case LOGIN_SUCCESS:
      // @ts-ignore global PhenylFunctionalGroupSkeleton
      const { accountPropName } = PhenylFunctionalGroupSkeleton.users[
        action.session.entityName
      ];
      return {
        ...state,
        busy: false,
        error: null,
        displayName: action.user[accountPropName],
        session: action.session,
        user: action.user
      };
    case LOGIN_FAILED:
      return {
        ...state,
        busy: false,
        error: action.error
      };
    case LOGOUT:
      return {
        ...state,
        ...initialState
      };
    default:
      return state;
  }
};

export const login = (
  entityName: string,
  credentials: Credentials
  // @TODO: define those any typs
) => async (dispatch: ThunkDispatch<any, any, any>) => {
  const client = new PhenylHttpClient({ url: window.location.origin });

  try {
    dispatch(loginRequest());
    const { user, session } = await client.login({
      entityName,
      credentials
    });
    dispatch(
      loginSuccess({
        user,
        session
      })
    );
  } catch (error) {
    dispatch(loginFailed(error));
  }
};

export const loginAsAnonymous = () => {
  return { type: LOGIN_AS_ANONYMOUS };
};

export const logout = () => {
  return { type: LOGOUT };
};

export const loginRequest = () => ({
  type: LOGIN_REQUEST
});

// @TODO: define those any types
export const loginSuccess = ({
  user,
  session
}: {
  user: any;
  session: any;
}) => {
  return { type: LOGIN_SUCCESS, user, session };
};

// @TODO: define those any types
export const loginFailed = (error: any) => {
  return { type: LOGIN_FAILED, error };
};
