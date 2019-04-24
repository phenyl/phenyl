import powerCrypt from "power-crypt";
import { createServerError } from "@phenyl/utils";

import { StandardEntityDefinition } from "./standard-entity-definition";
import { encryptPasswordInRequestData } from "./encrypt-password-in-request-data";
import { removePasswordFromResponseData } from "./remove-password-from-response-data";

import {
  GeneralReqResEntityMap,
  Key,
  EntityClient,
  UserDefinition,
  Session,
  AuthenticationResult,
  UserEntityRequestData,
  UserEntityResponseData
} from "@phenyl/interfaces";

import { EncryptFunction, AuthSetting, LoginCommandOf } from "./decls";

export type StandardUserDefinitionParams<
  M extends GeneralReqResEntityMap,
  A extends AuthSetting
> = {
  entityClient: EntityClient<M>;
  encrypt?: EncryptFunction<A>;
  accountPropName?: Key<M[Key<M>]> & Key<A["credentials"]>;
  passwordPropName?: Key<M[Key<M>]> & Key<A["credentials"]>;
  ttl?: number;
};

// Q: is it necessary and possible to implement EntityDefinition and UserDefinition both?
export class StandardUserDefinition<
  M extends GeneralReqResEntityMap,
  A extends AuthSetting
> extends StandardEntityDefinition implements UserDefinition {
  entityClient: EntityClient<M>;
  encrypt: EncryptFunction<A>;
  accountPropName: Key<M[Key<M>]> & Key<A["credentials"]>;
  passwordPropName: Key<M[Key<M>]> & Key<A["credentials"]>;
  ttl: number;

  constructor(params: StandardUserDefinitionParams<M, A>) {
    super(params);
    this.entityClient = params.entityClient;
    this.encrypt = params.encrypt || powerCrypt; // TODO: pass salt string to powerCrypt
    // @ts-ignore default
    this.accountPropName = params.accountPropName || "account";
    // @ts-ignore default
    this.passwordPropName = params.passwordPropName || "password";
    this.ttl = params.ttl || 60 * 60 * 24 * 365; // one year
  }

  async authenticate<N extends Key<M>>(
    loginCommand: LoginCommandOf<A, N>,
    session: Session | null | undefined
  ): Promise<AuthenticationResult<string, any>> {
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

  async wrapExecution(
    reqData: UserEntityRequestData,
    session: Session,
    executeFn: (
      reqData: UserEntityRequestData,
      session?: Session
    ) => Promise<UserEntityResponseData>
  ): Promise<UserEntityResponseData> {
    const newReqData = encryptPasswordInRequestData(
      reqData,
      this.passwordPropName,
      this.encrypt
    );
    const resData = await executeFn(newReqData, session);
    const newResData = removePasswordFromResponseData(
      resData,
      this.passwordPropName
    );
    return newResData;
  }
}

export const GeneralStandardUserDefinition: typeof StandardUserDefinition = StandardUserDefinition;
