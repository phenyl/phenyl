import { $bind, update } from "sp2";
import { Entity, GeneralResponseData } from "@phenyl/interfaces";

export type EntityVisitor = (entity: Entity) => Entity;

/**
 *
 */
export function visitEntitiesInResponseData(
  resData: GeneralResponseData,
  visitor: EntityVisitor
): GeneralResponseData {
  switch (resData.type) {
    case "get":
    case "findOne":
    case "insertAndGet":
    case "updateAndGet": {
      const newEntity = visitor(resData.payload.entity);
      if (newEntity === resData.payload.entity) return resData;
      const { $set, $docPath } = $bind<typeof resData>();
      return update(resData, $set($docPath("payload", "entity"), newEntity));
    }

    case "getByIds":
    case "find":
    case "insertAndGetMulti":
    case "updateAndFetch": {
      const newEntities = resData.payload.entities.map(visitor);
      const { $set, $docPath } = $bind<typeof resData>();
      return update(
        resData,
        $set($docPath("payload", "entities"), newEntities)
      );
    }

    case "pull":
    case "push": {
      // @ts-ignore
      if (resData.payload.entity == null) return resData;
      // @ts-ignore
      const newEntity = visitor(resData.payload.entity);

      const { $set, $docPath } = $bind<typeof resData>();
      // @ts-ignore
      if (newEntity === resData.payload.entity) return resData;
      // @ts-ignore
      return update(resData, $set($docPath("payload", "entity"), newEntity));
    }

    case "login": {
      if (resData.payload.user == null) return resData;
      const newUser = visitor(resData.payload.user);
      if (newUser === resData.payload.user) return resData;
      const { $set, $docPath } = $bind<typeof resData>();
      return update(resData, $set($docPath("payload", "user"), newUser));
    }

    case "insertOne":
    case "insertMulti":
    case "updateById":
    case "updateMulti":
    case "delete":
    case "logout": {
      return resData;
    }

    default:
      return resData;
  }
}
