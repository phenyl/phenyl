import {
  hasOwnNestedProperty
  // @ts-ignore remove this comment after @phenyl/oad-utils released
} from "oad-utils";

import { visitEntitiesInResponseData } from "@phenyl/utils";

import {
  assign
  // @ts-ignore remove this comment after @phenyl/power-assign released
} from "power-assign";

import { GeneralResponseData, Entity } from "@phenyl/interfaces";

export function removePasswordFromResponseData<
  M extends string | number | symbol
>(resData: GeneralResponseData, passwordPropName: M): GeneralResponseData {
  return visitEntitiesInResponseData(resData, (entity: Entity) => {
    if (!hasOwnNestedProperty(entity, passwordPropName)) return entity;
    return assign(entity, { $unset: { [passwordPropName]: "" } });
  });
}
