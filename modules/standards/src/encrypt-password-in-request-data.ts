import { GeneralRequestData } from "@phenyl/interfaces";

// @ts-ignore replace this after @phenyl/mongolike-operations released
import { DocumentPath } from "mongolike-operations";

import { EncryptFunction } from "../decls/index";

// @ts-ignore replace this after @phenyl/oad-utils released
import { getNestedValue } from "oad-utils";

// @ts-ignore remove this comment after @phenyl/oad-utils release
import { assign } from "power-assign";

export function encryptPasswordInRequestData(
  reqData: GeneralRequestData,
  passwordPropName: DocumentPath,
  encrypt: EncryptFunction
): GeneralRequestData {
  switch (reqData.method) {
    case "insertOne":
    case "insertMulti":
    case "insertAndGet":
    case "insertAndGetMulti": {
      const { payload } = reqData;
      // @ts-ignore TODO: Should GeneralRequestData be a interfaces rather than a type?
      const { value, values } = payload;

      if (values) {
        const valuesWithEncryptedPass = values.map((value: Object) => {
          const password = getNestedValue(value, passwordPropName);

          if (password) {
            return assign(value, {
              $set: { [passwordPropName]: encrypt(password) }
            });
          } else {
            return value;
          }
        });

        return assign(reqData, {
          $set: { "payload.values": valuesWithEncryptedPass }
        });
      } else if (value) {
        const password = getNestedValue(value, passwordPropName);

        if (password) {
          const valueWithEncryptedPass = assign(value, {
            $set: { [passwordPropName]: encrypt(password) }
          });
          return assign(reqData, {
            $set: { "payload.value": valueWithEncryptedPass }
          });
        } else {
          return reqData;
        }
      } else {
        return reqData;
      }
    }
    case "updateById":
    case "updateMulti":
    case "updateAndGet":
    case "updateAndFetch": {
      const { operation } = reqData.payload;

      let operationWithEncryptedPass = operation;

      Object.keys(operation).forEach(key => {
        // @ts-ignore TODO: fix Partial<UpdateOperationMap>
        const password = getNestedValue(operation[key], passwordPropName);

        if (password) {
          operationWithEncryptedPass = assign(operationWithEncryptedPass, {
            $set: { [`${key}.${passwordPropName}`]: encrypt(password) }
          });
        }
      });

      return assign(reqData, {
        $set: { "payload.operation": operationWithEncryptedPass }
      });
    }
    case "push":
      // TODO Implement to encrypt password in push command
      return reqData;

    default:
      return reqData;
  }
}
