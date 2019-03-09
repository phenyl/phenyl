// @ts-ignore remove this comment after @phenyl/power-crypt released
import powerCrypt from "power-crypt/jsnext";
import { createServerError } from "@phenyl/utils";

import { StandardEntityDefinition } from "./standard-entity-definition";
import { encryptPasswordInRequestData } from "./encrypt-password-in-request-data";
import { removePasswordFromResponseData } from "./remove-password-from-response-data";

import {
  GeneralAuthSetting,
  GeneralReqResEntityMap,
  EntityClient,
  EntityDefinition,
  UserDefinition,
  // @ts-ignore TODO: replace LoginCommandOf with new interface
  LoginCommandOf,
  Session,
  AuthenticationResult,
} from "@phenyl/interfaces";

import { EncryptFunction } from "../decls/index";

export type StandardUserDefinitionParams<
  M extends GeneralReqResEntityMap,
  A extends GeneralAuthSetting
> = {
  entityClient: EntityClient<M>;
  encrypt?: EncryptFunction;
  accountPropName?: keyof M[keyof M] & keyof A["credentials"] | string;
  passwordPropName?: keyof M[keyof M] & keyof A["credentials"] | string;
  ttl?: number;
};

// @ts-ignore TODO
export class StandardUserDefinition<
  M extends GeneralReqResEntityMap = GeneralReqResEntityMap,
  A extends GeneralAuthSetting = GeneralAuthSetting
> extends StandardEntityDefinition implements EntityDefinition, UserDefinition {
  entityClient: EntityClient<M>;
  encrypt: EncryptFunction;
  accountPropName: keyof M[keyof M] & keyof A["credentials"] | string;
  passwordPropName: keyof M[keyof M] & keyof A["credentials"] | string;
  ttl: number;

  constructor(params: StandardUserDefinitionParams<M, A>) {
    super(params);
    this.entityClient = params.entityClient;
    this.encrypt = params.encrypt || powerCrypt; // TODO: pass salt string to powerCrypt
    this.accountPropName = params.accountPropName || "account";
    this.passwordPropName = params.passwordPropName || "password";
    this.ttl = params.ttl || 60 * 60 * 24 * 365; // one year
  }

  async authentication<N extends keyof M>(
    loginCommand: LoginCommandOf<A, N>,
    session: Session | null | undefined
  ): Promise<AuthenticationResult<string, any>> {
    // eslint-disable-line no-unused-vars
    const { accountPropName, passwordPropName, ttl } = this;
    const { credentials, entityName } = loginCommand;

    const account = credentials[accountPropName];
    const password = credentials[passwordPropName];
    try {
      const result = await this.entityClient.findOne({
        entityName,
        where: {
          [accountPropName]: account,
          [passwordPropName]: this.encrypt(password)
        }
      });
      const user = result.entity;
      const expiredAt = new Date(Date.now() + ttl * 1000).toISOString();
      const preSession = { expiredAt, entityName, userId: user.id };
      return { preSession, user, versionId: result.versionId };
    } catch (e) {
      throw createServerError(e.message, "Unauthorized");
    }
  }

  // @TODO: improve type
  async wrapExecution(
    reqData: any,
    session: Session | null | undefined,
    executionFn: (
      reqDate: any,
      session: Session | null | undefined
    ) => Promise<any>
  ): Promise<any> {
    const newReqData = encryptPasswordInRequestData(
      reqData,
      this.passwordPropName,
      this.encrypt
    );
    const resData = await executionFn(newReqData, session);
    const newResData = removePasswordFromResponseData<
      keyof M[keyof M] & keyof A["credentials"] | string
    >(resData, this.passwordPropName);
    return newResData;
  }
}

export const GeneralStandardUserDefinition: typeof StandardUserDefinition = StandardUserDefinition;
