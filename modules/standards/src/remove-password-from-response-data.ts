import { hasOwnNestedProperty, update } from "sp2";

import { visitEntitiesInResponseData } from "@phenyl/utils";

import {
  UserEntityResponseData,
  ProEntity,
  GeneralReqResEntityMap,
  Key,
  Entity
} from "@phenyl/interfaces";

export function removePasswordFromResponseData<
  M extends GeneralReqResEntityMap,
  EN extends Key<M>,
  Ereqres extends M[Key<M>],
  C extends Object = Object
>(
  resData: UserEntityResponseData<EN, Ereqres["response"], C>,
  passwordPropName: string
): UserEntityResponseData<EN, Ereqres["response"], C> {
  return visitEntitiesInResponseData(
    resData,
    (entity: ProEntity): any => {
      if (!hasOwnNestedProperty(entity, passwordPropName)) return entity;
      const res = update(entity, { $unset: { [passwordPropName]: "" } });
      return res;
    }
  ) as UserEntityResponseData<EN, Ereqres["response"], C>;
}

export function removePasswordFromResponseEntity(
  entity: Entity,
  passwordPropName: string
): Entity {
  if (!hasOwnNestedProperty(entity, passwordPropName)) return entity;
  const res = update(entity, { $unset: { [passwordPropName]: "" } });
  return res as Entity;
}
