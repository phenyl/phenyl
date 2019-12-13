import {
  CustomCommandDefinition,
  CustomQueryDefinition,
  Entity,
  EntityDefinition,
  GeneralCustomCommandRequestData,
  GeneralCustomCommandResponseData,
  GeneralCustomQueryRequestData,
  GeneralCustomQueryResponseData,
  GeneralDefinition,
  GeneralEntityRequestData,
  GeneralEntityResponseData,
  GeneralRequestData,
  GeneralResponseData,
  GeneralUserEntityRequestData,
  LoginCommand,
  LoginResponseData,
  LogoutCommand,
  LogoutResponseData,
  Session,
  UserDefinition,
  GeneralUserEntityResponseData,
  GeneralEntityClient,
  GeneralSessionClient
} from "@phenyl/interfaces";

import { ErrorResponseData } from "@phenyl/interfaces";
import { createServerError } from "@phenyl/utils";

export abstract class DefinitionExecutor {
  definition: GeneralDefinition;

  constructor(definition: GeneralDefinition) {
    this.definition = definition;
  }

  async authorize(
    reqData: GeneralRequestData,
    session?: Session
  ): Promise<boolean> {
    return this.definition.authorize
      ? this.definition.authorize(reqData, session)
      : true;
  }

  async normalize(
    reqData: GeneralRequestData,
    session?: Session
  ): Promise<GeneralRequestData> {
    return this.definition.normalize
      ? this.definition.normalize(reqData, session)
      : reqData;
  }

  async validate(
    reqData: GeneralRequestData,
    session?: Session
  ): Promise<void> {
    if (this.definition.validate) {
      await this.definition.validate(reqData, session);
    }
  }

  async execute(
    reqData: GeneralRequestData,
    session?: Session
  ): Promise<GeneralResponseData> {
    return this.definition.wrapExecution
      ? this.definition.wrapExecution(
          reqData,
          session,
          this.executeOwn.bind(this)
        )
      : this.executeOwn(reqData, session);
  }

  abstract executeOwn(
    reqData: GeneralRequestData,
    session?: Session
  ): Promise<GeneralResponseData>;
}

/* eslint-disable-next-line */
export class EntityDefinitionExecutor extends DefinitionExecutor {
  definition: EntityDefinition;
  client: GeneralEntityClient;

  constructor(definition: EntityDefinition, client: GeneralEntityClient) {
    super(definition);
    this.definition = definition;
    this.client = client;
  }

  async executeOwn(
    reqData: GeneralEntityRequestData,
  ): Promise<GeneralEntityResponseData | ErrorResponseData> {
    return executeEntityRequestData(this.client, reqData);
  }
}

async function executeEntityRequestData(
  client: GeneralEntityClient,
  reqData: GeneralEntityRequestData,
): Promise<GeneralEntityResponseData> {
  switch (reqData.method) {
    case "find":
      return {
        type: "find",
        payload: await client.find(reqData.payload)
      };
    case "findOne":
      return {
        type: "findOne",
        payload: await client.findOne(reqData.payload)
      };
    case "get":
      return {
        type: "get",
        payload: await client.get(reqData.payload)
      };
    case "getByIds":
      return {
        type: "getByIds",
        payload: await client.getByIds(reqData.payload)
      };
    case "pull":
      return {
        type: "pull",
        payload: await client.pull(reqData.payload)
      };
    case "insertOne":
      return {
        type: "insertOne",
        payload: await client.insertOne(reqData.payload)
      };
    case "insertMulti":
      return {
        type: "insertMulti",
        payload: await client.insertMulti(reqData.payload)
      };
    case "insertAndGet":
      return {
        type: "insertAndGet",
        payload: await client.insertAndGet(reqData.payload)
      };
    case "insertAndGetMulti":
      return {
        type: "insertAndGetMulti",
        payload: await client.insertAndGetMulti(reqData.payload)
      };
    case "updateById":
      return {
        type: "updateById",
        payload: await client.updateById(reqData.payload)
      };
    case "updateMulti":
      return {
        type: "updateMulti",
        payload: await client.updateMulti(reqData.payload)
      };
    case "updateAndGet":
      return {
        type: "updateAndGet",
        payload: await client.updateAndGet(reqData.payload)
      };
    case "updateAndFetch":
      return {
        type: "updateAndFetch",
        payload: await client.updateAndFetch(reqData.payload)
      };
    case "push":
      return {
        type: "push",
        payload: await client.push(reqData.payload)
      };
    case "delete":
      return {
        type: "delete",
        payload: await client.delete(reqData.payload)
      };
    default:
      return {
        type: "error",
        payload: createServerError(
          // @ts-ignore reqData.method is `never` here.
          `Invalid method name "${reqData.method}".`,
          "NotFound"
        )
      };
  }
}

/* eslint-disable-next-line */
export class UserDefinitionExecutor extends DefinitionExecutor {
  definition: UserDefinition;
  client: GeneralEntityClient;
  sessionClient: GeneralSessionClient;

  constructor(
    definition: UserDefinition,
    client: GeneralEntityClient,
    sessionClient: GeneralSessionClient
  ) {
    super(definition);
    this.definition = definition;
    this.client = client;
    this.sessionClient = sessionClient;
  }

  async executeOwn(
    reqData: GeneralUserEntityRequestData,
    session?: Session
  ): Promise<GeneralUserEntityResponseData> {
    if (reqData.method == "logout") {
      return this.logout(reqData.payload);
    }
    if (reqData.method == "login") {
      return this.login(reqData.payload, session);
    }

    return executeEntityRequestData(this.client, reqData);
  }

  private async login(
    loginCommand: LoginCommand<string, Object>,
    session?: Session
  ): Promise<LoginResponseData<string, Entity, Object>> {
    const result = await this.definition.authenticate(loginCommand, session);
    const newSession = await this.sessionClient.create(result.preSession);
    return {
      type: "login",
      payload: {
        user: result.user,
        versionId: result.versionId,
        session: newSession
      }
    };
  }

  private async logout(
    logoutCommand: LogoutCommand<string>
  ): Promise<LogoutResponseData> {
    const { sessionId } = logoutCommand;
    const result = await this.sessionClient.delete(sessionId);

    if (!result) {
      throw createServerError("sessionId not found", "BadRequest");
    }

    return {
      type: "logout",
      payload: { ok: 1 }
    };
  }
}

/* eslint-disable-next-line */
export class CustomQueryDefinitionExecutor extends DefinitionExecutor {
  definition: CustomQueryDefinition;
  client: GeneralEntityClient;

  constructor(definition: CustomQueryDefinition, client: GeneralEntityClient) {
    super(definition);
    this.definition = definition;
    this.client = client;
  }

  async executeOwn(
    reqData: GeneralCustomQueryRequestData,
    session?: Session
  ): Promise<GeneralCustomQueryResponseData | ErrorResponseData> {
    return {
      type: "runCustomQuery",
      payload: await this.definition.execute(reqData.payload, session)
    };
  }
}

/* eslint-disable-next-line */
export class CustomCommandDefinitionExecutor extends DefinitionExecutor {
  definition: CustomCommandDefinition;
  client: GeneralEntityClient;

  constructor(
    definition: CustomCommandDefinition,
    client: GeneralEntityClient
  ) {
    super(definition);
    this.definition = definition;
    this.client = client;
  }

  async executeOwn(
    reqData: GeneralCustomCommandRequestData,
    session?: Session
  ): Promise<GeneralCustomCommandResponseData | ErrorResponseData> {
    return {
      type: "runCustomCommand",
      payload: await this.definition.execute(reqData.payload, session)
    };
  }
}
