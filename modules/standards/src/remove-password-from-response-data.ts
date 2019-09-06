import { hasOwnNestedProperty, update } from "sp2";

import { visitEntitiesInResponseData } from "@phenyl/utils";

import {
  ProEntity,
  Entity,
  GeneralUserEntityResponseData
} from "@phenyl/interfaces";

export function removePasswordFromResponseData(
  resData: GeneralUserEntityResponseData,
  passwordPropName: string
): GeneralUserEntityResponseData {
  return visitEntitiesInResponseData(
    resData,
    (entity: ProEntity): any => {
      if (!hasOwnNestedProperty(entity, passwordPropName)) return entity;
      const res = update(entity, { $unset: { [passwordPropName]: "" } });
      return res;
    }
  ) as GeneralUserEntityResponseData;
}

export function removePasswordFromResponseEntity(
  entity: Entity,
  passwordPropName: string
): Entity {
  if (!hasOwnNestedProperty(entity, passwordPropName)) return entity;
  const res = update(entity, { $unset: { [passwordPropName]: "" } });
  return res as Entity;
}
