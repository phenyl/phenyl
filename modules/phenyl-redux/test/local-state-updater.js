/* eslint-env mocha */
import assert from 'assert'
import { createDocumentPath } from 'oad-utils/jsnext'
import { assign } from 'power-assign'
import { LocalStateUpdater } from '../src/local-state-updater'
import { PhenylReduxModule } from '../src/phenyl-redux-module'
import { actions } from '../src/phenyl-redux-module'

describe('LocalStateUpdater', () => {
	describe('addUnreachedCommits', () => {
		it('can append IdUpdateCommand to unreachedCommits', () => {
			const command = actions.commit({
				id: 'hoge',
				entityName: 'foo',
				operation: {
					$set: { bar: 'buzz' }
				}
			})
			const state = PhenylReduxModule.createInitialState()
			const newState = assign(state, LocalStateUpdater.addUnreachedCommits(state, command))

			assert.deepStrictEqual(state.unreachedCommits, [])
			assert.deepStrictEqual(newState.unreachedCommits, [command])
		})
	})
	describe('removeUnreachedCommits', () => {
		it('can remove IdUpdateCommand from unreachedCommits', () => {
			const command = actions.commit({
				id: 'hoge',
				entityName: 'foo',
				operation: {
					$set: { bar: 'buzz' }
				}
			})
			const initialState = PhenylReduxModule.createInitialState()
			const state = assign(initialState, LocalStateUpdater.addUnreachedCommits(initialState, command))
			const newState = assign(state, LocalStateUpdater.removeUnreachedCommits(state, command))

			assert.deepStrictEqual(state.unreachedCommits, [command])
			assert.deepStrictEqual(newState.unreachedCommits, [])
		})
		it('can remove multiple IdUpdateCommand', () => {
			const command1 = actions.commit({
				id: 'jacj',
				entityName: 'users',
				operation: {
					$set: { name: 'Jack' }
				}
			})
			const command2 = actions.commit(Object.assign({}, command1, { operation: { $set: { age: 35 } } }))
			const command3 = actions.commit(Object.assign({}, command1, { operation: { $set: { verified: true } } }))

			const initialState = PhenylReduxModule.createInitialState()
			const state = assign(initialState, LocalStateUpdater.addUnreachedCommits(initialState, command1, command2, command3))
			const newState = assign(state, LocalStateUpdater.removeUnreachedCommits(state, command1, command3))

			assert.deepStrictEqual(state.unreachedCommits, [command1, command2, command3])
			assert.deepStrictEqual(newState.unreachedCommits, [command2])
		})
	})
})
