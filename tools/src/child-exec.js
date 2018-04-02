// @flow
/* eslint-env node */
/* eslint-disable no-console */

import fs from 'fs'
import { run as runCommand } from './lib/shell.js'
import PhenylModule from './lib/phenyl-module.js'
import PhenylModuleGraph, { type PlainPhenylModuleGraph, type BumpTypesByModuleName } from './lib/phenyl-module-graph.js'
export type MethodName = 'clean' | 'load' | 'build' | 'test' | 'bump' | 'publish'
export type ExecParams = $Shape<{
  bumpTypesByModuleName: BumpTypesByModuleName
}>

export type InterProcessMessage = {
  type: 'message',
  payload: {
    text: string,
    color?: 'cyan' | 'green'
  }
}


export type PlainChildExec = {
  moduleName: string,
  graph: PlainPhenylModuleGraph,
}

export type ChildInfo = {
  methodName: MethodName,
  params: ?ExecParams,
} & PlainChildExec


type SendFunction = (message: InterProcessMessage) => void

export default class ChildExec {
  moduleName: string
  graph: PhenylModuleGraph
  send: SendFunction

  constructor(plain: PlainChildExec, send: SendFunction) {
    this.moduleName = plain.moduleName
    this.graph = new PhenylModuleGraph(plain.graph)
    this.send = send
  }

  get phenylModule(): PhenylModule {
    return this.graph.getModule(this.moduleName)
  }

  run(methodName: MethodName, params: ?ExecParams) {
    switch (methodName) {
      case 'clean': {
        return this.clean()
      }
      case 'test': {
        return this.test()
      }
      case 'load': {
        return this.load()
      }
      case 'build': {
        return this.build()
      }
      case 'bump': {
        if (params == null) {
          throw new Error('No params given.')
        }
        const { bumpTypesByModuleName } = params
        return this.bump(bumpTypesByModuleName)
      }
      case 'publish': {
        return this.publish()
      }
    }
  }

  clean() {
    const { phenylModule } = this
    this.send({ type: 'message', payload: { text: `[${phenylModule.name}] clean start.`, color: 'cyan' } })
    const shellCommand = phenylModule.cleanCommand()
    runCommand(shellCommand)
    this.send({ type: 'message', payload: { text: `[${phenylModule.name}] ✓ clean done.`, color: 'green' } })
  }

  test() {
    const { phenylModule } = this
    this.send({ type: 'message', payload: { text: `[${phenylModule.name}] test start.`, color: 'cyan' } })

    if (phenylModule.hasTest) {
      const iter = phenylModule.testCommands(this.graph)
      let shellResult, iterResult = iter.next()
      while (!iterResult.done) {
        const shellCommand = iterResult.value
        shellResult = runCommand(shellCommand)
        iterResult = iter.next(shellResult)
      }
      const succeeded = iterResult.value
      return succeeded ? 0 : 1
    }
    this.send({ type: 'message', payload: { text: `No test specified in "${phenylModule.name}".` } })
  }

  load() {
    const { phenylModule } = this
    this.send({ type: 'message', payload: { text: `[${phenylModule.name}] start install.`, color: 'cyan' } })
    const iter = phenylModule.installCommands(this.graph)
    let shellResult, iterResult = iter.next()
    while (!iterResult.done) {
      const shellCommand = iterResult.value
      shellResult = runCommand(shellCommand)
      iterResult = iter.next(shellResult)
    }
    this.send({ type: 'message', payload: { text: `[${phenylModule.name}] ✓ install done.\n`, color: 'green' } })
  }

  build() {
    const { phenylModule } = this
    const iter = phenylModule.buildCommands()
    let iterResult = iter.next()
    while (!iterResult.done) {
      const shellCommand = iterResult.value
      const shellResult = runCommand(shellCommand)
      iterResult = iter.next(shellResult)
    }
  }

  bump(bumpTypesByModuleName: BumpTypesByModuleName) {
    const { phenylModule } = this
    const versions = this.graph.getBumpedVersions(bumpTypesByModuleName)
    const change = phenylModule.bump(versions)
    if (change) {
      // $FlowIssue(dynamic-require-json)
      const packageJson = Object.assign(require(phenylModule.packageJsonPath), change)
      fs.writeFileSync(phenylModule.packageJsonPath, JSON.stringify(packageJson, null, 2))
    }
  }

  publish() {
    const { phenylModule } = this
    this.send({ type: 'message', payload: { text: `[${phenylModule.name}] start publishing.`, color: 'cyan' } })

    const iter = phenylModule.publishCommands(this.graph)
    let iterResult = iter.next()
    while (!iterResult.done) {
      const shellCommand = iterResult.value
      const shellResult = runCommand(shellCommand)
      iterResult = iter.next(shellResult)
    }
    this.send({ type: 'message', payload: { text: `[${phenylModule.name}] ✓ publish done.\n`, color: 'green' } })
  }
}

process.once('message', (childInfo: ChildInfo) => {
  const send = (msg: InterProcessMessage) => process.send ? process.send(msg): console.log(msg)

  const child = new ChildExec(childInfo, send)
  const { methodName, params } = childInfo
  // $FlowIssue(methodName-is-compatible)
  const status = child[methodName](params)
  process.exit(status == null ? 0 : status)
})
