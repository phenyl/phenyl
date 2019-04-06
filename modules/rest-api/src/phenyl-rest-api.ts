import {
  AuthCommandMapOf,
  EntityClient,
  EveryNameOf,
  FunctionalGroup,
  GeneralRequestData,
  GeneralResponseData,
  GeneralTypeMap,
  HandlerResult,
  Nullable,
  ReqResEntityMapOf,
  RequestDataWithTypeMapForResponse,
  RequestMethodName,
  ResponseDataWithTypeMap,
  RestApiHandler,
  SessionClient,
  VersionDiffPublisher
} from "@phenyl/interfaces";
import {
  CustomCommandDefinitionExecutor,
  CustomQueryDefinitionExecutor,
  DefinitionExecutor,
  EntityDefinitionExecutor,
  UserDefinitionExecutor
} from "./definition-executor";
import {
  PhenylRestApiDirectClient,
  assertValidRequestData,
  createServerError
} from "@phenyl/utils";

import { createVersionDiff } from "./create-version-diff";

type DefinitionExecutorMap = {
  user: { [key: string]: UserDefinitionExecutor };
  entity: { [key: string]: EntityDefinitionExecutor };
  customQuery: { [key: string]: CustomQueryDefinitionExecutor };
  customCommand: { [key: string]: CustomCommandDefinitionExecutor };
};

/**
 *
 */
export class PhenylRestApi<TM extends GeneralTypeMap>
  implements RestApiHandler<TM> {
  readonly client: EntityClient<ReqResEntityMapOf<TM>>;
  readonly sessionClient: SessionClient<AuthCommandMapOf<TM>>;
  readonly versionDiffPublisher: Nullable<VersionDiffPublisher>;
  private readonly definitionExecutors: DefinitionExecutorMap;

  constructor(
    fg: FunctionalGroup,
    params: {
      client: EntityClient<ReqResEntityMapOf<TM>>;
      sessionClient: SessionClient<AuthCommandMapOf<TM>>;
    }
  ) {
    this.client = params.client;
    this.sessionClient = params.sessionClient;
    this.definitionExecutors = this.createDefinitionExecutors(fg);
  }

  /**
   *
   */
  public async handleRequestData<
    MN extends RequestMethodName,
    N extends EveryNameOf<TM, MN>
  >(
    reqData: RequestDataWithTypeMapForResponse<TM, MN, N>
  ): HandlerResult<ResponseDataWithTypeMap<TM, MN, N>> {
    try {
      assertValidRequestData(reqData);
      const session = await this.sessionClient.get(reqData.sessionId!);
      const executor = this.getExecutor(
        reqData.method,
        this.extractName(reqData)
      );
      const isAccessible = await executor.authorize(reqData, session);
      if (!isAccessible) {
        return {
          type: "error",
          payload: createServerError("Authorization Required.", "Unauthorized")
        };
      }
      const normalizedReqData = await executor.normalize(reqData, session);

      try {
        await executor.validate(normalizedReqData, session);
      } catch (validationError) {
        validationError.message = `Validation Failed. ${
          validationError.mesage
        }`;
        return {
          type: "error",
          payload: createServerError(validationError, "BadRequest")
        };
      }

      const resData = await executor.execute(normalizedReqData, session);

      this.publishVersionDiff(normalizedReqData, resData);
      return resData as ResponseDataWithTypeMap<TM, MN, N>;
    } catch (e) {
      return {
        type: "error",
        payload: createServerError(e)
      };
    }
  }

  /**
   *
   */
  public createDirectClient(): PhenylRestApiDirectClient<TM> {
    return new PhenylRestApiDirectClient<TM>(this);
  }

  private getExecutor(
    methodName: RequestMethodName,
    name: string
  ): DefinitionExecutor {
    if (methodName === "login" || methodName === "logout") {
      if (this.definitionExecutors.user[name]) {
        return this.definitionExecutors.user[name];
      }
      throw createServerError(
        `No user entity name found: "${name}"`,
        "NotFound"
      );
    }
    if (methodName === "runCustomQuery") {
      if (this.definitionExecutors.customQuery[name]) {
        return this.definitionExecutors.customQuery[name];
      }
      throw createServerError(
        `No user custom query name found: "${name}"`,
        "NotFound"
      );
    }
    if (methodName === "runCustomCommand") {
      if (this.definitionExecutors.customCommand[name]) {
        return this.definitionExecutors.customCommand[name];
      }
      throw createServerError(
        `No user custom command name found: "${name}"`,
        "NotFound"
      );
    }

    if (this.definitionExecutors.entity[name]) {
      return this.definitionExecutors.entity[name];
    }
    if (this.definitionExecutors.user[name]) {
      return this.definitionExecutors.user[name];
    }
    throw createServerError(`No entity name found: "${name}"`, "NotFound");
  }

  /**
   * Publish entity version diffs.
   */
  private publishVersionDiff(
    reqData: GeneralRequestData,
    resData: GeneralResponseData
  ) {
    if (this.versionDiffPublisher == null) return;
    const versionDiffs = createVersionDiff(reqData, resData);

    for (const versionDiff of versionDiffs) {
      this.versionDiffPublisher.publishVersionDiff(versionDiff);
    }
  }

  private extractName(
    reqData: GeneralRequestData
  ): EveryNameOf<TM, RequestMethodName> {
    if (reqData.method === "runCustomQuery") return reqData.payload.name;
    if (reqData.method === "runCustomCommand") return reqData.payload.name;
    return reqData.payload.entityName;
  }

  private createDefinitionExecutors(
    fg: FunctionalGroup
  ): DefinitionExecutorMap {
    const user = fg.users
      ? Object.entries(fg.users).reduce(
          (acc, [name, def]) => ({
            ...acc,
            [name]: new UserDefinitionExecutor(
              def,
              this.client,
              this.sessionClient
            )
          }),
          {}
        )
      : {};
    const entity = fg.nonUsers
      ? Object.entries(fg.nonUsers).reduce(
          (acc, [name, def]) => ({
            ...acc,
            [name]: new EntityDefinitionExecutor(def, this.client)
          }),
          {}
        )
      : {};
    const customQuery = fg.customQueries
      ? Object.entries(fg.customQueries).reduce(
          (acc, [name, def]) => ({
            ...acc,
            [name]: new CustomQueryDefinitionExecutor(def, this.client)
          }),
          {}
        )
      : {};
    const customCommand = fg.customCommands
      ? Object.entries(fg.customCommands).reduce(
          (acc, [name, def]) => ({
            ...acc,
            [name]: new CustomCommandDefinitionExecutor(def, this.client)
          }),
          {}
        )
      : {};
    return { user, entity, customQuery, customCommand };
  }
}
