// @flow

import type {
  CommandResult,
  CustomQuery,
  CustomQueryResult,
  CustomCommand,
  CustomCommandResult,
  DeleteCommand,
  EntityClient,
  ErrorResult,
  MultiValuesCommandResult,
  GetCommandResult,
  Id,
  IdQuery,
  IdsQuery,
  InsertCommand,
  PullQuery,
  PullQueryResult,
  PushCommand,
  PushCommandResult,
  SingleInsertCommand,
  MultiInsertCommand,
  LoginCommand,
  LoginCommandResult,
  LogoutCommand,
  LogoutCommandResult,
  RequestData,
  ResponseData,
  QueryResult,
  SingleQueryResult,
  UpdateCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  WhereQuery,
} from 'phenyl-interfaces'

/**
 * Wrapper of EntityClient
 */
export class OkClient {
  client: $Subtype<EntityClient>

  constructor(client: EntityClient) {
    this.client = client
  }

  createError(result: ErrorResult): Error {
    const { message, type, stack } = result
    const error = new Error(`${message} (ErrorResultType = "${type}")`)
    if (stack) error.stack = stack
    return error
  }

  /**
   *
   */
  async find(query: WhereQuery, sessionId?: ?Id): Promise<QueryResult> {
    const result = await this.client.find(query, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async findOne(query: WhereQuery, sessionId?: ?Id): Promise<SingleQueryResult> {
    const result = await this.client.findOne(query, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async get(query: IdQuery, sessionId?: ?Id): Promise<SingleQueryResult> {
    const result = await this.client.get(query, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async getByIds(query: IdsQuery, sessionId?: ?Id): Promise<QueryResult> {
    const result = await this.client.getByIds(query, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async pull(query: PullQuery, sessionId?: ?Id): Promise<PullQueryResult> {
    const result = await this.client.pull(query, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async insert(command: InsertCommand, sessionId?: ?Id): Promise<CommandResult> {
    const result = await this.client.insert(command, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async insertAndGet(command: SingleInsertCommand, sessionId?: ?Id): Promise<GetCommandResult> {
    const result = await this.client.insertAndGet(command, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async insertAndGetMulti(command: MultiInsertCommand, sessionId?: ?Id): Promise<MultiValuesCommandResult> {
    const result = await this.client.insertAndGetMulti(command, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async update(command: UpdateCommand, sessionId?: ?Id): Promise<CommandResult> {
    const result = await this.client.update(command, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async updateAndGet(command: IdUpdateCommand, sessionId?: ?Id): Promise<GetCommandResult> {
    const result = await this.client.updateAndGet(command, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async updateAndFetch(command: MultiUpdateCommand, sessionId?: ?Id): Promise<MultiValuesCommandResult> {
    const result = await this.client.updateAndFetch(command, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async push(command: PushCommand, sessionId?: ?Id): Promise<PushCommandResult> {
    const result = await this.client.push(command, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async delete(command: DeleteCommand, sessionId?: ?Id): Promise<CommandResult> {
    const result = await this.client.delete(command, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async runCustomQuery(query: CustomQuery, sessionId?: ?Id): Promise<CustomQueryResult> {
    const result = await this.client.runCustomQuery(query, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async runCustomCommand(command: CustomCommand, sessionId?: ?Id): Promise<CustomCommandResult> {
    const result = await this.client.runCustomQuery(command, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async login(command: LoginCommand, sessionId?: ?Id): Promise<LoginCommandResult> {
    const result = await this.client.login(command, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }

  /**
   *
   */
  async logout(command: LogoutCommand, sessionId?: ?Id): Promise<LogoutCommandResult> {
    const result = await this.client.logout(command, sessionId)
    if (!result.ok) throw this.createError(result)
    return result
  }
}
