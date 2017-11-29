import PhenylHttpClient from 'phenyl-http-client'
import { PhenylResponseError } from 'phenyl-utils'
import type { PhenylError } from 'phenyl-interfaces'

const EXECUTE_START = 'operation/EXECUTE_START'
const EXECUTE_FINISHED = 'operation/EXECUTE_FINISHED'
const EXECUTE_FAILED = 'operation/EXECUTE_FAILED'

const initialState = {
  isFetching: false,
  spent: -1,
  response: null, // FIXME
  error: null,
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case EXECUTE_START:
      return {
        ...state,
        ...initialState,
        isFetching: true,
      }
    case EXECUTE_FINISHED:
      return {
        ...state,
        isFetching: false,
        spent: action.spent,
        response: action.response,
      }
    case EXECUTE_FAILED:
      return {
        ...state,
        isFetching: false,
        spent: action.spent,
        error: action.error,
      }
    default:
      return state
  }
}

export const startExecute = () => ({
  type: EXECUTE_START,
})

export const receiveResponse = (response: any, spent: number) => ({
  type: EXECUTE_FINISHED,
  spent,
  response,
})

export const receiveErrorResponse = (error: PhenylError, spent: number) => ({
  type: EXECUTE_FAILED,
  spent,
  error,
})

export const execute = ({ sessionId, entityName, operation, payload }) => async (dispatch) => {
  const client = new PhenylHttpClient({ url: window.location.origin })
  dispatch(startExecute())

  const start = new Date()
  let response = null
  try {
    switch (operation) {
      case 'find':
        response = await client.find({ entityName, ...payload }, sessionId)
        break

      case 'findOne':
        response = await client.findOne({ entityName, ...payload }, sessionId)
        break

      case 'get':
        response = await client.get({ entityName, ...payload }, sessionId)
        break

      case 'getByIds':
        response = await client.getByIds({ entityName, ...payload }, sessionId)
        break

      case 'pull':
        response = await client.pull({ entityName, ...payload }, sessionId)
        break

      case 'insertOne':
        response = await client.insertOne({ entityName, ...payload }, sessionId)
        break

      case 'insertAndGet':
        response = await client.insertAndGet({ entityName, ...payload }, sessionId)
        break

      case 'insertAndGetMulti':
        response = await client.insertAndGetMulti({ entityName, ...payload }, sessionId)
        break

      case 'updateById':
        response = await client.updateById({ entityName, ...payload }, sessionId)
        break

      case 'updateAndGet':
        response = await client.updateAndGet({ entityName, ...payload }, sessionId)
        break

      case 'updateMulti':
        response = await client.updateMulti({ entityName, ...payload }, sessionId)
        break

      case 'updateAndFetch':
        response = await client.updateAndFetch({ entityName, ...payload }, sessionId)
        break

      case 'push':
        response = await client.push({ entityName, ...payload }, sessionId)
        break

      case 'delete':
        response = await client.delete({ entityName, ...payload }, sessionId)
        break

      case 'login':
        response = await client.login({ entityName, ...payload }, sessionId)
        break

      case 'logout':
        response = await client.logout({ entityName, ...payload }, sessionId)
        break

      default:
        throw new Error(`Unknown operation: ${operation}`)
    }

    dispatch(receiveResponse(response, new Date() - start))
  } catch (e) {
    dispatch(receiveErrorResponse(e, new Date() - start))
  }
}
