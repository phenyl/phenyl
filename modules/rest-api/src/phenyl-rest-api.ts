import {
  AuthCommandMapOf,
  EntityClient,
  EveryNameOf,
  FunctionalGroup,
  GeneralRequestData,
  GeneralResponseData,
  GeneralTypeMap,
  Nullable,
  RequestDataWithTypeMapForResponse,
  RequestMethodName,
  ResponseDataWithTypeMap,
  SessionClient,
  VersionDiffPublisher,
  ResponseEntityMapOf,
  ErrorResponseData,
  GeneralRestApiHandler,
  GeneralFunctionalGroup,
  GeneralSessionClient,
  GeneralEntityClient,
  DirectRestApiHandler,
  DirectRestApiOptions
} from "@phenyl/interfaces";
import {
  PhenylRestApiDirectClient,
  assertValidRequestData,
  createServerError
} from "@phenyl/utils";

import {
  CustomCommandApiDefinitionExecutor,
  CustomQueryApiDefinitionExecutor,
  DefinitionExecutor,
  EntityRestApiDefinitionExecutor,
  UserRestApiDefinitionExecutor
} from "./definition-executor";
import { createVersionDiff } from "./create-version-diff";

type DefinitionExecutorMap = {
  user: { [key: string]: UserRestApiDefinitionExecutor };
  entity: { [key: string]: EntityRestApiDefinitionExecutor };
  customQuery: { [key: string]: CustomQueryApiDefinitionExecutor };
  customCommand: { [key: string]: CustomCommandApiDefinitionExecutor };
};

/**
 *
 */
export class PhenylRestApi<TM extends GeneralTypeMap = GeneralTypeMap>
  implements DirectRestApiHandler<TM>, GeneralRestApiHandler {
  readonly entityClient: EntityClient<ResponseEntityMapOf<TM>>;
  readonly sessionClient: SessionClient<AuthCommandMapOf<TM>>;
  readonly versionDiffPublisher: Nullable<VersionDiffPublisher>;
  private readonly definitionExecutors: DefinitionExecutorMap;

  constructor(
    fg: FunctionalGroup<TM>,
    params: {
      entityClient: GeneralEntityClient;
      sessionClient?: GeneralSessionClient;
      versionDiffPublisher?: VersionDiffPublisher;
    }
  ) {
    this.entityClient = params.entityClient as EntityClient<
      ResponseEntityMapOf<TM>
    >;

    this.sessionClient =
      (params.sessionClient as SessionClient<AuthCommandMapOf<TM>>) ||
      this.entityClient.createSessionClient<AuthCommandMapOf<TM>>();

    this.versionDiffPublisher = params.versionDiffPublisher;

    this.definitionExecutors = this.createDefinitionExecutors(fg);
  }

  get client(): EntityClient<ResponseEntityMapOf<TM>> {
    return this.entityClient;
  }

  /**
   *
   */
  public async handleRequestData<
    MN extends RequestMethodName,
    N extends EveryNameOf<TM, MN>
  >(
    reqData: RequestDataWithTypeMapForResponse<TM, MN, N>,
    options: DirectRestApiOptions = { skipAuthorization: false }
  ): Promise<ResponseDataWithTypeMap<TM, MN, N> | ErrorResponseData> {
    try {
      assertValidRequestData(reqData);
      const session = await this.sessionClient.get(reqData.sessionId!);
      const executor = this.getExecutor(
        reqData.method,
        this.extractName(reqData)
      );
      if (!options.skipAuthorization) {
        const isAccessible = await executor.authorize(reqData, session);
        if (!isAccessible) {
          return {
            type: "error",
            payload: createServerError(
              "Authorization Required.",
              "Unauthorized"
            )
          };
        }
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
      return { type: "error", payload: createServerError(e) };
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
    fg: GeneralFunctionalGroup
  ): DefinitionExecutorMap {
    const clients = {
      entityClient: this.entityClient,
      sessionClient: this.sessionClient,
      directClient: this.createDirectClient()
    };
    const user = fg.users
      ? Object.entries(fg.users).reduce(
          (acc, [name, def]) => ({
            ...acc,
            [name]: new UserRestApiDefinitionExecutor(def, clients)
          }),
          {}
        )
      : {};
    const entity = fg.nonUsers
      ? Object.entries(fg.nonUsers).reduce(
          (acc, [name, def]) => ({
            ...acc,
            [name]: new EntityRestApiDefinitionExecutor(def, clients)
          }),
          {}
        )
      : {};
    const customQuery = fg.customQueries
      ? Object.entries(fg.customQueries).reduce(
          (acc, [name, def]) => ({
            ...acc,
            [name]: new CustomQueryApiDefinitionExecutor(def, clients)
          }),
          {}
        )
      : {};
    const customCommand = fg.customCommands
      ? Object.entries(fg.customCommands).reduce(
          (acc, [name, def]) => ({
            ...acc,
            [name]: new CustomCommandApiDefinitionExecutor(def, clients)
          }),
          {}
        )
      : {};
    return { user, entity, customQuery, customCommand };
  }
}
