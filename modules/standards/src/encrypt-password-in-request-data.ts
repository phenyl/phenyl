<<<<<<< HEAD
import { GeneralRequestData } from "@phenyl/interfaces";

import { $bind, update, DocumentPath, getNestedValue } from "sp2";
=======
import {
  UserEntityRequestData,
  GeneralReqResEntityMap,
  Key,
} from '@phenyl/interfaces'

import { $bind, update, DocumentPath, getNestedValue } from 'sp2'
>>>>>>> fix types

import { EncryptFunction } from "./decls";

<<<<<<< HEAD
export function encryptPasswordInRequestData(
  reqData: GeneralRequestData,
  passwordPropName: DocumentPath,
  encrypt: EncryptFunction
): GeneralRequestData {
=======
export function encryptPasswordInRequestData<
  M extends GeneralReqResEntityMap,
  C extends Object,
  EN extends Key<M>,
  Ereqres extends M[EN]
>(
  reqData: UserEntityRequestData<EN, Ereqres['request'], C>,
  passwordPropName: DocumentPath,
  encrypt: EncryptFunction,
): UserEntityRequestData<EN, Ereqres['request'], C> {
>>>>>>> fix types
  switch (reqData.method) {
    case "insertOne":
    case "insertAndGet": {
      const { payload } = reqData;
      const { value } = payload;
      const password = getNestedValue(value, passwordPropName);

      if (password) {
<<<<<<< HEAD
        const { $set, $docPath } = $bind<typeof value>();
        const valueWithEncryptedPass = update(
          value,
          $set($docPath(passwordPropName), encrypt(password))
        );
        const { $set: $OtherSet, $docPath: $otherDocPath } = $bind<
          typeof reqData
        >();
        return update(
          reqData,
          $OtherSet($otherDocPath("payload", "value"), valueWithEncryptedPass)
        );
=======
        const { $set, $docPath } = $bind<typeof value>()
        const valueWithEncryptedPass = update(
          value,
          // @ts-ignore password always exists
          $set($docPath(passwordPropName), encrypt({ password })),
        )
        const { $set: $OtherSet, $docPath: $otherDocPath } = $bind<
          typeof reqData
        >()
        return update(
          reqData,
          $OtherSet($otherDocPath('payload', 'value'), valueWithEncryptedPass),
        )
>>>>>>> fix types
      } else {
        return reqData;
      }
    }
    case "insertMulti":
    case "insertAndGetMulti": {
      const { payload } = reqData;
      const { values } = payload;

      const valuesWithEncryptedPass = values.map(value => {
        const password = getNestedValue(value, passwordPropName);

        if (password) {
<<<<<<< HEAD
          const { $set, $docPath } = $bind<typeof value>();
          return update(
            value,
            $set($docPath(passwordPropName), encrypt(password))
          );
=======
          const { $set, $docPath } = $bind<typeof value>()
          return update(
            value,
            // @ts-ignore password always exists
            $set($docPath(passwordPropName), encrypt(password)),
          )
>>>>>>> fix types
        } else {
          return value;
        }
<<<<<<< HEAD
      });
      const { $set, $docPath } = $bind<typeof reqData>();
      return update(
        reqData,
        $set($docPath("payload", "values"), valuesWithEncryptedPass)
      );
    }
    case "updateById":
    case "updateMulti":
    case "updateAndGet":
    case "updateAndFetch": {
      const { operation } = reqData.payload;

      let operationWithEncryptedPass = operation;
=======
      })
      const { $set, $docPath } = $bind<typeof reqData>()
      return update(
        reqData,
        $set($docPath('payload', 'values'), valuesWithEncryptedPass),
      )
    }
    case 'updateById':
    case 'updateMulti':
    case 'updateAndGet':
    case 'updateAndFetch': {
      const { operation } = reqData.payload

      let operationWithEncryptedPass = operation
>>>>>>> fix types

      Object.keys(operation).forEach((key: any) => {
        // @ts-ignore: Partial<UpdateOperationMap> has no index signature.
        const password = getNestedValue(operation[key], passwordPropName);

        if (password) {
<<<<<<< HEAD
          const { $set, $docPath } = $bind<typeof operationWithEncryptedPass>();
          operationWithEncryptedPass = update(
            operationWithEncryptedPass,
            $set($docPath(key, passwordPropName), encrypt(password))
          );
=======
          const { $set, $docPath } = $bind<typeof operationWithEncryptedPass>()
          operationWithEncryptedPass = update(
            operationWithEncryptedPass,
            $set($docPath(key, passwordPropName), encrypt(password)),
          )
>>>>>>> fix types
        }
      });

<<<<<<< HEAD
      const { $set, $docPath } = $bind<typeof reqData>();
      return update(
        reqData,
        $set($docPath("payload", "operation"), operationWithEncryptedPass)
      );
=======
      const { $set, $docPath } = $bind<typeof reqData>()
      return update(
        reqData,
        $set($docPath('payload', 'operation'), operationWithEncryptedPass),
      )
>>>>>>> fix types
    }
    case "push":
      // TODO Implement to encrypt password in push command
      return reqData;

    default:
      return reqData;
  }
}
