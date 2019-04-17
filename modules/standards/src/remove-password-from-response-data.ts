import { hasOwnNestedProperty, update } from "sp2";

import { visitEntitiesInResponseData } from "@phenyl/utils";

import { GeneralResponseData, ProEntity } from "@phenyl/interfaces";

export function removePasswordFromResponseData(
  resData: GeneralResponseData,
  passwordPropName: string
): GeneralResponseData {
  return visitEntitiesInResponseData(
    resData,
    (entity: ProEntity): any => {
      if (!hasOwnNestedProperty(entity, passwordPropName)) return entity;
      const res = update(entity, { $unset: { [passwordPropName]: "" } });
      return res;
    }
  );
}
