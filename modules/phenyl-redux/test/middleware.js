/* eslint-env mocha */
import assert from 'assert'
import { createMiddleware } from '../src/middleware'
import { actions } from '../src/phenyl-redux-module'

describe('MiddlewareCreator', () => {
  describe('create', () => {
    const createMockStore = (phenylState) => ({
      getState() {
        return {
          phenyl: phenylState,
        }
      }
    })
    const middleware = createMiddleware({
      storeKey: 'phenyl',
      client: null
    })

    describe('Action phenyl/online', () => {
      it('Dispatch an operation that make isOnline to true', async () => {
        const expected = {
          type: 'phenyl/assign',
          payload: [
            { '$set': { 'network.isOnline': true } }
          ],
        }

        const store = createMockStore({})
        const next = ({ type, payload }) => assert.deepStrictEqual(expected, { type, payload })
        await middleware(store)(next)(actions.online())
      })
    })
    describe('Action phenyl/offline', () => {
      it('Dispatch an operation that make isOnline to false', async () => {
        const expected = {
          type: 'phenyl/assign',
          payload: [
            { '$set': { 'network.isOnline': false } }
          ],
        }

        const store = createMockStore({})
        const next = ({ type, payload }) => assert.deepStrictEqual(expected, { type, payload })
        await middleware(store)(next)(actions.offline())
      })
    })
  })
})
