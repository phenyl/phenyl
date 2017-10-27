// @flow
import type {
  RequestData,
  RequestDataHandlers,
} from 'phenyl-interfaces'

export async function switchByRequestMethod<T>(reqData: RequestData, funcs: RequestDataHandlers<T>): Promise<T> {
  switch (reqData.method) {
    case 'find': {
      const result = funcs.find ? await funcs.find(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
    case 'findOne': {
      const result = funcs.findOne ? await funcs.findOne(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
    case 'get': {
      const result = funcs.get ? await funcs.get(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
    case 'getByIds': {
      const result = funcs.getByIds ? await funcs.getByIds(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
    case 'insert': {
      const result = funcs.insert ? await funcs.insert(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
    case 'insertAndGet': {
      const result = funcs.insertAndGet ? await funcs.insertAndGet(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
    case 'insertAndGetMulti': {
      const result = funcs.insertAndGetMulti ? await funcs.insertAndGetMulti(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
    case 'update': {
      const result = funcs.update ? await funcs.update(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
    case 'updateAndGet': {
      const result = funcs.updateAndGet ? await funcs.updateAndGet(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
    case 'updateAndFetch': {
      const result = funcs.updateAndFetch ? await funcs.updateAndFetch(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
    case 'delete': {
      const result = funcs.delete ? await funcs.delete(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
    case 'runCustomQuery': {
      const result = funcs.runCustomQuery ? await funcs.runCustomQuery(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
    case 'runCustomCommand': {
      const result = funcs.runCustomCommand ? await funcs.runCustomCommand(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
    case 'login': {
      const result = funcs.login ? await funcs.login(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
    case 'logout': {
      const result = funcs.logout ? await funcs.logout(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
    default: {
      const result = funcs.notMatch ? await funcs.notMatch(reqData.payload) : await funcs.handleDefault(reqData)
      return result
    }
  }
}
