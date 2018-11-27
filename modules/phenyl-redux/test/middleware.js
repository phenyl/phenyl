/* eslint-env mocha */
import assert from 'assert'
import { createDocumentPath } from 'oad-utils/jsnext'
import { createServerError, createLocalError } from 'phenyl-utils/jsnext'
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
    const runActions = async (middleware, originStore, actions) => {
      let store = originStore
      const actionsToDispatch = []
      for (let action of actions) {
        await middleware(store)((action) => {
          const newState = assign(store.getState().phenyl, ...action.payload)
          actionsToDispatch.push(action)
          store = createMockStore(newState)
        })(action)
      }

      return [actionsToDispatch, store]
    }

    describe('Action phenyl/online', () => {
      const middleware = createMiddleware({ storeKey: 'phenyl', client: null })
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
      const middleware = createMiddleware({ storeKey: 'phenyl', client: null })
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
    describe('Action phenyl/push', () => {
      const entityName = 'users'
      const id = 'some-id'
      const operation = {
        $set: {
          [createDocumentPath('nickname')]: 'John'
        }
      }
      const store = createMockStore({
        network: {
          requests: []
        },
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

      it('Does nothing when commits are empty', async () => {
        const middleware = createMiddleware({ storeKey: 'phenyl', client: null })
        const next = (action) => assert.deepStrictEqual(action, pushAction)

        const pushAction = actions.push({ entityName, id })
        await middleware(store)(next)(pushAction)
      })
      it('Dispatch an operation that append tag to pending requests', async () => {
        const middleware = createMiddleware({
          storeKey: 'phenyl',
          client: {
            push: async () => ({
              hasEntity: false,
              operations: [],
              versionId: 'zzz'
            })
          }
        })

        const action = actions.push({ entityName, id })
        const [actionsToDispatch] = await runActions(middleware, store, [
          actions.commit({ entityName, id, operation }),
          action
        ])
        assert.deepStrictEqual(actionsToDispatch[1].payload, [{
          $push: {
            'network.requests': action.tag
          }
        }])
      })

      describe('Response contains entity', () => {
        const middleware = createMiddleware({
          storeKey: 'phenyl',
          client: {
            push: async () => ({
              hasEntity: true,
              entity: {
                id,
                nickname: 'Jack'
              },
              versionId: 'zzz'
            })
          }
        })
        it('Dispatch an operation that remove tag from pending requests when request success', async () => {
          const action = actions.push({ entityName, id })
          const [actionsToDispatch, newStore] = await runActions(middleware, store, [
            actions.commit({ entityName, id, operation }),
            action
          ])
          assert.deepStrictEqual(newStore.getState().phenyl.network.requests, [])
        })
        it('Dispatch an operation that synchronize local state', async () => {
          const action = actions.push({ entityName, id })
          const [actionsToDispatch, newStore] = await runActions(middleware, store, [
            actions.commit({ entityName, id, operation }),
            action
          ])
          assert.deepStrictEqual(newStore.getState().phenyl.entities[entityName][id].origin, { id, nickname: 'Jack' })
          assert.deepStrictEqual(newStore.getState().phenyl.entities[entityName][id].head, null)
        })
      })
      describe('Response contains operations', () => {
        const middleware = createMiddleware({
          storeKey: 'phenyl',
          client: {
            push: async () => ({
              hasEntity: false,
              operations: [
                {
                  $set: {
                    age: 35
                  }
                }
              ],
              versionId: 'xxx'
            })
          }
        })
        it('Dispatch an operation that synchronize local state', async () => {
          const action = actions.push({ entityName, id })
          const [actionsToDispatch, newStore] = await runActions(middleware, store, [
            actions.commit({ entityName, id, operation }),
            action
          ])
          assert.deepStrictEqual(newStore.getState().phenyl.entities[entityName][id].origin, { nickname: 'John', age: 35 })
          assert.deepStrictEqual(newStore.getState().phenyl.entities[entityName][id].head, null)
        })
      })
      describe('Request failed with NetworkFailed', () => {
        const middleware = createMiddleware({
          storeKey: 'phenyl',
          client: {
            push: () => Promise.reject(createLocalError('Invalid value.', 'NetworkFailed'))
          }
        })
        it('Dispatch an operation that make isOnline to false', async () => {
          const action = actions.push({ entityName, id })
          const [actionsToDispatch, newStore] = await runActions(middleware, store, [
            actions.commit({ entityName, id, operation }),
            action
          ])
          assert.deepStrictEqual(newStore.getState().phenyl.network.isOnline, false)
        })
        it('Dispatch an operation that remove tag from pending requests when request failed', async () => {
          const action = actions.push({ entityName, id })
          const [actionsToDispatch, newStore] = await runActions(middleware, store, [
            actions.commit({ entityName, id, operation }),
            action
          ])
          assert.deepStrictEqual(actionsToDispatch[1].payload, [{
            $push: {
              'network.requests': action.tag,
            }
          }])
          assert.deepStrictEqual(newStore.getState().phenyl.network.requests, [])
        })
      })
      describe('Request fail with Authorization', () => {
        const middleware = createMiddleware({
          storeKey: 'phenyl',
          client: {
            push: () => Promise.reject(createServerError('Authorization Required.', 'Unauthorized'))
          }
        })
        it('Dispatch an operation that revert local commits', async () => {
          const action = actions.push({ entityName, id })
          const [actionsToDispatch, newStore] = await runActions(middleware, store, [
            actions.commit({ entityName, id, operation }),
            actions.commit({ entityName, id, operation: { $set: { age: 32 } } }),
            actions.commit({ entityName, id, operation: { $set: { emailVerified: true } } }),
            action
          ])

          assert.deepStrictEqual(newStore.getState().phenyl.entities[entityName][id].commits, [])
          assert.deepStrictEqual(newStore.getState().phenyl.entities[entityName][id].origin, { nickname: 'Taro' })
          assert.deepStrictEqual(newStore.getState().phenyl.entities[entityName][id].head, { nickname: 'Taro' })
        })
        it('Dispatch an operation that remove tag from pending requests when request failed', async () => {
          const action = actions.push({ entityName, id })
          const [actionsToDispatch, newStore] = await runActions(middleware, store, [
            actions.commit({ entityName, id, operation }),
            action
          ])
          assert.deepStrictEqual(actionsToDispatch[1].payload, [{
            $push: {
              'network.requests': action.tag,
            }
          }])
          assert.deepStrictEqual(newStore.getState().phenyl.network.requests, [])
        })
      })
      describe('Request failed with unexpected error', () => {
        const middleware = createMiddleware({
          storeKey: 'phenyl',
          client: {
            push: () => Promise.reject(createServerError('Unexpected'))
          }
        })
        it('Dispatch an operation that set error', async () => {
          const action = actions.push({ entityName, id })
          const [actionsToDispatch, newStore] = await runActions(middleware, store, [
            actions.commit({ entityName, id, operation }),
            action
          ])

          assert.deepStrictEqual(newStore.getState().phenyl.error, {
            actionTag: action.tag,
            at: 'server',
            message: 'Unexpected',
            type: 'BadRequest',
          })
        })
        it('Dispatch an operation that remove tag from pending requests when request failed', async () => {
          const action = actions.push({ entityName, id })
          const [actionsToDispatch, newStore] = await runActions(middleware, store, [
            actions.commit({ entityName, id, operation }),
            action
          ])
          assert.deepStrictEqual(actionsToDispatch[1].payload, [{
            $push: {
              'network.requests': action.tag,
            }
          }])
          assert.deepStrictEqual(newStore.getState().phenyl.network.requests, [])
        })
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
      const middleware = createMiddleware({ storeKey: 'phenyl', client: null })

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
