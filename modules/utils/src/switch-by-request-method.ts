import {
  GeneralTypeMap,
  RequestData,
  RequestDataHandlers
} from "@phenyl/interfaces";
export async function switchByRequestMethod<TM extends GeneralTypeMap, T>(
  reqData: RequestData,
  funcs: RequestDataHandlers<TM, T>
): Promise<T> {
  // prettier-ignore
  switch (reqData.method) {
    case "find":
      return funcs.find ?
        // @ts-ignore
          await funcs.find(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "findOne":
      return funcs.findOne ?
        // @ts-ignore
          await funcs.findOne(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "get":
      return funcs.get ?
        // @ts-ignore
          await funcs.get(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "getByIds":
      return funcs.getByIds ?
        // @ts-ignore
          await funcs.getByIds(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "pull":
      return funcs.pull ?
        // @ts-ignore
          await funcs.pull(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "insertOne":
      return funcs.insertOne ?
        // @ts-ignore
          await funcs.insertOne(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "insertMulti":
      return funcs.insertMulti ?
        // @ts-ignore
          await funcs.insertMulti(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "insertAndGet":
      return funcs.insertAndGet ?
        // @ts-ignore
          await funcs.insertAndGet(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "insertAndGetMulti":
      return funcs.insertAndGetMulti ?
        // @ts-ignore
          await funcs.insertAndGetMulti(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "updateById":
      return funcs.updateById ?
        // @ts-ignore
          await funcs.updateById(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "updateMulti":
      return funcs.updateMulti ?
        // @ts-ignore
          await funcs.updateMulti(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "updateAndGet":
      return funcs.updateAndGet ?
        // @ts-ignore
          await funcs.updateAndGet(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "updateAndFetch":
      return funcs.updateAndFetch ?
        // @ts-ignore
          await funcs.updateAndFetch(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "push":
      return funcs.push ?
        // @ts-ignore
          await funcs.push(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "delete":
      return funcs.delete ?
        // @ts-ignore
          await funcs.delete(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "runCustomQuery":
      return funcs.runCustomQuery ?
        // @ts-ignore
          await funcs.runCustomQuery(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "runCustomCommand":
      return funcs.runCustomCommand ?
        // @ts-ignore
          await funcs.runCustomCommand(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "login":
      return funcs.login ?
        // @ts-ignore
          await funcs.login(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "logout":
      return funcs.logout ?
        // @ts-ignore
          await funcs.logout(reqData.payload)
        : await funcs.handleDefault(reqData);

    default:
      return funcs.notMatch ?
        // @ts-ignore
          await funcs.notMatch(reqData.payload)
        : await funcs.handleDefault(reqData);
  }
}
