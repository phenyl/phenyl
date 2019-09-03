import {
  UserEntityNameOf,
  CustomCommandNameOf,
  CustomQueryNameOf,
  EntityNameOf,
  GeneralTypeMap,
  RequestDataHandlers,
  RequestDataWithTypeMap
} from "@phenyl/interfaces";

export async function switchByRequestMethod<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>,
  QN extends CustomQueryNameOf<TM>,
  CN extends CustomCommandNameOf<TM>,
  UN extends UserEntityNameOf<TM>,
  T
>(
  reqData: RequestDataWithTypeMap<TM, EN, QN, CN, UN>,
  funcs: RequestDataHandlers<TM, T>
): Promise<T> {
  // prettier-ignore
  switch (reqData.method) {
    case "find":
      return funcs.find ?
          await funcs.find(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "findOne":
      return funcs.findOne ?
          await funcs.findOne(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "get":
      return funcs.get ?
          await funcs.get(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "getByIds":
      return funcs.getByIds ?
          await funcs.getByIds(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "pull":
      return funcs.pull ?
          await funcs.pull(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "insertOne":
      return funcs.insertOne ?
          await funcs.insertOne(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "insertMulti":
      return funcs.insertMulti ?
          await funcs.insertMulti(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "insertAndGet":
      return funcs.insertAndGet ?
          await funcs.insertAndGet(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "insertAndGetMulti":
      return funcs.insertAndGetMulti ?
          await funcs.insertAndGetMulti(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "updateById":
      return funcs.updateById ?
          await funcs.updateById(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "updateMulti":
      return funcs.updateMulti ?
          await funcs.updateMulti(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "updateAndGet":
      return funcs.updateAndGet ?
          await funcs.updateAndGet(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "updateAndFetch":
      return funcs.updateAndFetch ?
          await funcs.updateAndFetch(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "push":
      return funcs.push ?
          await funcs.push(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "delete":
      return funcs.delete ?
          await funcs.delete(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "runCustomQuery":
      return funcs.runCustomQuery ?
          await funcs.runCustomQuery(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "runCustomCommand":
      return funcs.runCustomCommand ?
          await funcs.runCustomCommand(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "login":
      return funcs.login ?
          await funcs.login(reqData.payload)
        : await funcs.handleDefault(reqData);

    case "logout":
      return funcs.logout ?
          await funcs.logout(reqData.payload)
        : await funcs.handleDefault(reqData);

    default:
      return funcs.notMatch ?
        // @ts-ignore reqData.payload falls into `never` here.
          await funcs.notMatch(reqData.payload)
        : await funcs.handleDefault(reqData);
  }
}
