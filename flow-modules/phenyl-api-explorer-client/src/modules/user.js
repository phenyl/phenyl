/* global PhenylFunctionalGroupSkeleton */
import PhenylHttpClient from 'phenyl-http-client'

const LOGIN = 'user/LOGIN'
const LOGIN_AS_ANONYMOUS = 'user/LOGIN_AS_ANONYMOUS'
const LOGIN_REQUEST = 'user/LOGIN_REQUEST'
const LOGIN_SUCCESS = 'user/LOGIN_SUCCESS'
const LOGIN_FAILED = 'user/LOGIN_FAILED'
const LOGOUT = 'user/LOGOUT'

const initialState = {
  busy: false,
  displayName: '',
  session: null,
  anonymous: false,
  user: null,
  error: null,
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        anonymous: false,
        session: null,
        user: null,
        error: null,
      }
    case LOGIN_AS_ANONYMOUS:
      return {
        ...state,
        busy: false,
        anonymous: true,
        session: null,
        user: null,
        error: null,
      }
    case LOGIN_REQUEST:
      return {
        ...state,
        busy: true
      }
    case LOGIN_SUCCESS:
      const { accountPropName } = PhenylFunctionalGroupSkeleton.users[action.session.entityName]
      return {
        ...state,
        busy: false,
        error: null,
        displayName: action.user[accountPropName],
        session: action.session,
        user: action.user,
      }
    case LOGIN_FAILED:
      return {
        ...state,
        busy: false,
        error: action.error,
      }
    case LOGOUT:
      return {
        ...state,
        ...initialState,
      }
    default:
      return state
  }
}

export const login = (entityName, credentials) => async (dispatch) => {
  const client = new PhenylHttpClient({ url: window.location.origin })

  try {
    dispatch(loginRequest())
    const { ok, user, session } = await client.login({
      entityName,
      credentials,
    })
    if (!ok) {
      throw new Error('Unknown error: ok=0')
    }
    dispatch(loginSuccess({
      user,
      session,
    }))
  } catch (error) {
    dispatch(loginFailed(error))
  }
}

export const loginAsAnonymous = () => {
  return { type: LOGIN_AS_ANONYMOUS }
}

export const logout = () => {
  return { type: LOGOUT }
}

export const loginRequest = () => ({
  type: LOGIN_REQUEST,
})

export const loginSuccess = ({ user, session }) => {
  return { type: LOGIN_SUCCESS, user, session }
}

export const loginFailed = (error) => {
  return { type: LOGIN_FAILED, error }
}
