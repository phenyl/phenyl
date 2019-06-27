import {
  CustomCommandDefinition,
  CustomQueryDefinition,
  Entity,
  EntityClient,
  EntityDefinition,
  GeneralCustomCommandRequestData,
  GeneralCustomCommandResponseData,
  GeneralCustomQueryRequestData,
  GeneralCustomQueryResponseData,
  GeneralEntityRequestData,
  GeneralEntityResponseData,
  GeneralRequestData,
  GeneralResponseData,
  GeneralUserEntityRequestData,
  UserEntityResponseData,
  LoginCommand,
  LoginResponseData,
  LogoutCommand,
  LogoutResponseData,
  Session,
  SessionClient,
  UserDefinition
} from "@phenyl/interfaces";

import { createServerError } from "@phenyl/utils";
import { ErrorResponseData } from "@phenyl/interfaces";

export class EntityDefinitionExecutor implements DefinitionExecutor {
  definition: EntityDefinition;
  client: EntityClient;

  constructor(definition: EntityDefinition, client: EntityClient) {
    this.definition = definition;
    this.client = client;

    if (this.definition.authorize == null) {
      this.authorize = () => Promise.resolve(true);
    }
    if (this.definition.normalize == null) {
      this.normalize = val => Promise.resolve(val);
    }
    if (this.definition.validate == null) {
      this.validate = () => Promise.resolve();
    }
    if (this.definition.wrapExecution == null) {
      this.execute = executeEntityRequestData.bind(this, this.client);
    }
  }

  async authorize(
    reqData: GeneralEntityRequestData,
    session?: Session
  ): Promise<boolean> {
    return this.definition.authorize!(reqData, session);
  }

  async validate(
    reqData: GeneralEntityRequestData,
    session?: Session
  ): Promise<void> {
    return this.definition.validate!(reqData, session);
  }

  async normalize(
    reqData: GeneralEntityRequestData,
    session?: Session
  ): Promise<GeneralEntityRequestData> {
    return this.definition.normalize!(reqData, session);
  }

  async execute(
    reqData: GeneralEntityRequestData,
    session?: Session
  ): Promise<GeneralEntityResponseData | ErrorResponseData> {
    if (session === undefined) {
      const errorResult: ErrorResponseData = {
        type: "error",
        payload: createServerError(
          `Execute method ${reqData.method} must needs session`
        )
      };
      return errorResult;
    }
    return this.definition.wrapExecution!(
      reqData,
      session,
      executeEntityRequestData.bind(this, this.client)
    );
  }
}

async function executeEntityRequestData(
  client: EntityClient,
  reqData: GeneralEntityRequestData,
  session?: Session
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

export class UserDefinitionExecutor implements DefinitionExecutor {
  definition: UserDefinition;
  client: EntityClient;
  sessionClient: SessionClient;

  constructor(
    definition: UserDefinition,
    client: EntityClient,
    sessionClient: SessionClient
  ) {
    this.definition = definition;
    this.client = client;
    this.sessionClient = sessionClient;

    if (this.definition.authorize == null) {
      this.authorize = () => Promise.resolve(true);
    }
    if (this.definition.normalize == null) {
      this.normalize = val => Promise.resolve(val);
    }
    if (this.definition.validate == null) {
      this.validate = () => Promise.resolve();
    }
    if (this.definition.wrapExecution == null) {
      this.execute = executeEntityRequestData.bind(this, this.client);
    }
  }

  async authorize(
    reqData: GeneralUserEntityRequestData,
    session?: Session
  ): Promise<boolean> {
    return this.definition.authorize!(reqData, session);
  }

  async validate(
    reqData: GeneralUserEntityRequestData,
    session?: Session
  ): Promise<void> {
    return this.definition.validate!(reqData, session);
  }

  async normalize(
    reqData: GeneralUserEntityRequestData,
    session?: Session
  ): Promise<GeneralUserEntityRequestData> {
    return this.definition.normalize!(reqData, session);
  }

  async execute(
    reqData: GeneralUserEntityRequestData,
    session?: Session
  ): Promise<UserEntityResponseData | ErrorResponseData> {
    // TODO: use HandlerRequest Type instead of Promise
    if (reqData.method == "logout") {
      return this.logout(reqData.payload);
    }
    if (reqData.method == "login") {
      return this.login(reqData.payload, session);
    }

    if (session === undefined) {
      const errorResult: ErrorResponseData = {
        type: "error",
        payload: createServerError(
          `Method ${reqData.method} requires an active session`,
          "Unauthorized"
        )
      };
      return errorResult;
    }
    return this.definition.wrapExecution!(
      reqData,
      session,
      executeEntityRequestData.bind(this, this.client)
    );
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

export class CustomQueryDefinitionExecutor implements DefinitionExecutor {
  definition: CustomQueryDefinition;
  client: EntityClient;

  constructor(definition: CustomQueryDefinition, client: EntityClient) {
    this.definition = definition;
    this.client = client;

    if (this.definition.authorize == null) {
      this.authorize = () => Promise.resolve(true);
    }
    if (this.definition.normalize == null) {
      this.normalize = val => Promise.resolve(val);
    }
    if (this.definition.validate == null) {
      this.validate = () => Promise.resolve();
    }
  }

  async authorize(
    reqData: GeneralCustomQueryRequestData,
    session?: Session
  ): Promise<boolean> {
    return this.definition.authorize!(reqData, session);
  }

  async validate(
    reqData: GeneralCustomQueryRequestData,
    session?: Session
  ): Promise<void> {
    return this.definition.validate!(reqData, session);
  }

  async normalize(
    reqData: GeneralCustomQueryRequestData,
    session?: Session
  ): Promise<GeneralCustomQueryRequestData> {
    return this.definition.normalize!(reqData, session);
  }

  async execute(
    reqData: GeneralCustomQueryRequestData,
    session?: Session
  ): Promise<GeneralCustomQueryResponseData | ErrorResponseData> {
    return {
      type: "runCustomQuery",
      payload: await this.definition.execute(reqData.payload, session)
    };
  }
}

export class CustomCommandDefinitionExecutor implements DefinitionExecutor {
  definition: CustomCommandDefinition;
  client: EntityClient;

  constructor(definition: CustomCommandDefinition, client: EntityClient) {
    this.definition = definition;
    this.client = client;

    if (this.definition.authorize == null) {
      this.authorize = () => Promise.resolve(true);
    }
    if (this.definition.normalize == null) {
      this.normalize = val => Promise.resolve(val);
    }
    if (this.definition.validate == null) {
      this.validate = () => Promise.resolve();
    }
  }

  async authorize(
    reqData: GeneralCustomCommandRequestData,
    session?: Session
  ): Promise<boolean> {
    return this.definition.authorize!(reqData, session);
  }

  async validate(
    reqData: GeneralCustomCommandRequestData,
    session?: Session
  ): Promise<void> {
    return this.definition.validate!(reqData, session);
  }

  async normalize(
    reqData: GeneralCustomCommandRequestData,
    session?: Session
  ): Promise<GeneralCustomCommandRequestData> {
    return this.definition.normalize!(reqData, session);
  }

  async execute(
    reqData: GeneralCustomCommandRequestData,
    session?: Session
  ): Promise<GeneralCustomCommandResponseData | ErrorResponseData> {
    return {
      type: "runCustomCommand",
      payload: await this.definition.execute(reqData.payload, session)
    };
  }
}

export interface DefinitionExecutor {
  authorize(reqData: GeneralRequestData, session?: Session): Promise<boolean>;

  normalize(
    reqData: GeneralRequestData,
    session?: Session
  ): Promise<GeneralRequestData>;

  validate(reqData: GeneralRequestData, session?: Session): Promise<void>;

  execute(
    reqData: GeneralRequestData,
    session?: Session
  ): Promise<GeneralResponseData>;
}
