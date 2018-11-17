/* eslint-env mocha */
import assert from 'assert'
import { createDocumentPath } from 'oad-utils/jsnext'
import { assign } from 'power-assign'
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
    describe('Action phenyl/commit', () => {
      const entityName = 'users'
      const id = 'some-id'
      const operation = {
        $set: {
          [createDocumentPath('nickname')]: 'John'
        }
      }
      const store = createMockStore({
        entities: {
          [entityName]: {
            [id]: {
              origin: {
                nickname: 'Taro'
              },
              head: null,
              commits: []
            }
          }
        }
      })

      it('Dispatch an operation that create commit', async () => {
        const next = ({ type, payload }) => {
          const { phenyl: state } = store.getState()
          const newState = assign(state, ...payload)
          assert.strictEqual(type, 'phenyl/assign')
          assert.deepStrictEqual(newState.entities[entityName][id].commits, [{
            $set: {
              nickname: 'John'
            }
          }])
        }
        await middleware(store)(next)(actions.commit({
          entityName,
          id,
          operation
        }))
      })
      it('Dispatch an operation that update head state', async () => {
        const next = ({ type, payload }) => {
          const { phenyl: state } = store.getState()
          const newState = assign(state, ...payload)
          assert.strictEqual(type, 'phenyl/assign')
          assert.deepStrictEqual(newState.entities[entityName][id].head, {
            nickname: 'John'
          })
        }
        await middleware(store)(next)(actions.commit({
          entityName,
          id,
          operation
        }))
      })
      it('Dispatch an operation that don\'t update origin state', async () => {
        const next = ({ type, payload }) => {
          const { phenyl: state } = store.getState()
          const newState = assign(state, ...payload)
          assert.strictEqual(state.entities[entityName][id].origin, newState.entities[entityName][id].origin)
        }
        await middleware(store)(next)(actions.commit({
          entityName,
          id,
          operation
        }))
      })
    })
  })
})
