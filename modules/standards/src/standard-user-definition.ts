import powerCrypt from "power-crypt";
import { createServerError } from "@phenyl/utils";

import { encryptPasswordInRequestData } from "./encrypt-password-in-request-data";
import {
  removePasswordFromResponseData,
  removePasswordFromResponseEntity
} from "./remove-password-from-response-data";

import {
  UserRestApiDefinition,
  Session,
  GeneralAuthenticationResult,
  GeneralUserEntityRequestData,
  GeneralUserEntityResponseData,
  GeneralEntityClient,
  GeneralLoginCommand,
  GeneralRestApiSettings
} from "@phenyl/interfaces";

import { EncryptFunction } from "./decls";

export type StandardUserRestApiDefinitionParams = {
  entityClient?: GeneralEntityClient;
  encrypt?: EncryptFunction;
  accountPropName?: string;
  passwordPropName?: string;
  ttl?: number;
};

// Alias for backward compatibility
export type StandardUserDefinitionParams = StandardUserRestApiDefinitionParams;

export class StandardUserRestApiDefinition implements UserRestApiDefinition {
  entityClient?: GeneralEntityClient;
  encrypt: EncryptFunction;
  accountPropName: string;
  passwordPropName: string;
  ttl: number;

  constructor(params: StandardUserRestApiDefinitionParams) {
    this.entityClient = params.entityClient;
    this.encrypt = params.encrypt || powerCrypt; // TODO: pass salt string to powerCrypt
    this.accountPropName = params.accountPropName || "account";
    this.passwordPropName = params.passwordPropName || "password";
    this.ttl = params.ttl || 60 * 60 * 24 * 365; // one year
  }

  async authenticate(
    loginCommand: GeneralLoginCommand,
    session: Session | undefined,
    settings: GeneralRestApiSettings
  ): Promise<GeneralAuthenticationResult> {
    const { accountPropName, passwordPropName, ttl } = this;
    const { credentials, entityName } = loginCommand;
    if (credentials == null) {
      throw createServerError(
        "Invalid credentials: No credentials found.",
        "Unauthorized"
      );
    }

    // @ts-ignore
    const account: string = credentials[accountPropName];
    // @ts-ignore
    const password: string = credentials[passwordPropName];

    if (!account) {
      throw createServerError(
        `Invalid credentials: the given account field "${accountPropName}" is empty.`,
        "Unauthorized"
      );
    }

    if (!password) {
      throw createServerError(
        `Invalid credentials: the given password field "${passwordPropName}" is empty.`,
        "Unauthorized"
      );
    }

    try {
      const entityClient = this.entityClient || settings.entityClient;
      const result = await entityClient.findOne({
        entityName,
        where: {
          [accountPropName]: account,
          [passwordPropName]: this.encrypt(password)
        }
      });
      const user = removePasswordFromResponseEntity(
        result.entity,
        passwordPropName
      );
      const expiredAt = new Date(Date.now() + ttl * 1000).toISOString();
      const preSession = { expiredAt, entityName, userId: user.id };
      return { preSession, user, versionId: result.versionId };
    } catch (e) {
      throw createServerError(e.message, "Unauthorized");
    }
  }

  async wrapExecution(
    reqData: GeneralUserEntityRequestData,
    session: Session | undefined,
    executeFn: (
      reqData: GeneralUserEntityRequestData,
      session?: Session
    ) => Promise<GeneralUserEntityResponseData>
  ): Promise<GeneralUserEntityResponseData> {
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

// Alias for backward compatibility
export const StandardUserDefinition = StandardUserRestApiDefinition;
