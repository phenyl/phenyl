// @flow
import fp from 'fetch-ponyfill'
const { fetch } = fp()

import type {
  CommandResult,
  CustomQuery,
  CustomQueryResult,
  CustomCommand,
  CustomCommandResult,
  DeleteCommand,
  FetchCommandResult,
  GetCommandResult,
  Id,
  IdQuery,
  IdsQuery,
  InsertCommand,
  Request,
  PhenylClient,
  PhenylCustomClient,
  Restorable,
  UpdateCommand,
  WhereQuery,
} from 'phenyl-interfaces'

type HttpClientParams = {
  url: string,
  sessionId: Id,
}

export default class PhenylHttpClient implements PhenylClient, PhenylCustomClient {
  url: string
  sessionId: Id

  constructor(params: HttpClientParams) {
    this.url = params.url
    this.sessionId = params.sessionId
  }
  /**
   *
   */
  async find(query: WhereQuery): Promise<Array<Restorable>> {
    const request: Request = { find: query }
    const params = {
      s: this.sessionId,
      o: request,
    }
    const response: { body: Array<Restorable> } = await fetch(`${this.url}?d=${encodeURIComponent(JSON.stringify(params))}`, {
      method: 'GET',
    }).then(res => res.json())

    return response.body
  }

  /**
   *
   */
  async findOne(query: WhereQuery): Promise<Restorable> {
    const request: Request = { findOne: query }
    const params = {
      s: this.sessionId,
      o: request,
    }
    const response: { body: Restorable } = await fetch(`${this.url}?d=${encodeURIComponent(JSON.stringify(params))}`, {
      method: 'GET',
    }).then(res => res.json())

    return response.body
  }

  /**
   *
   */
  async get(query: IdQuery): Promise<Restorable> {
    const request: Request = { get: query }
    const params = {
      s: this.sessionId,
      o: request,
    }
    const response: { body: Restorable } = await fetch(`${this.url}?d=${encodeURIComponent(JSON.stringify(params))}`, {
      method: 'GET',
    }).then(res => res.json())

    return response.body
  }

  /**
   *
   */
  async getByIds(query: IdsQuery): Promise<Array<Restorable>> {
    const request: Request = { getByIds: query }
    const params = {
      s: this.sessionId,
      o: request,
    }
    const response: { body: Array<Restorable> } = await fetch(`${this.url}?d=${encodeURIComponent(JSON.stringify(params))}`, {
      method: 'GET',
    }).then(res => res.json())

    return response.body
  }

  /**
   *
   */
  async insert(command: InsertCommand): Promise<CommandResult> {
    const request: Request = { insert: command }
    const params = {
      s: this.sessionId,
      o: request,
    }
    const response: { body: CommandResult } = await fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(params)
    }).then(res => res.json())

    return response.body
  }

  /**
   *
   */
  async insertAndGet(command: InsertCommand): Promise<GetCommandResult> {
    const request: Request = { insertAndGet: command }
    const params = {
      s: this.sessionId,
      o: request,
    }
    const response: { body: GetCommandResult } = await fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(params)
    }).then(res => res.json())

    return response.body
  }

  /**
   *
   */
  async insertAndFetch(command: InsertCommand): Promise<FetchCommandResult> {
    const request: Request = { insertAndFetch: command }
    const params = {
      s: this.sessionId,
      o: request,
    }
    const response: { body: FetchCommandResult } = await fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(params)
    }).then(res => res.json())

    return response.body
  }

  /**
   *
   */
  async update(command: UpdateCommand): Promise<CommandResult> {
    const request: Request = { update: command }
    const params = {
      s: this.sessionId,
      o: request,
    }
    const response: { body: CommandResult } = await fetch(this.url, {
      method: 'PUT',
      body: JSON.stringify(params)
    }).then(res => res.json())

    return response.body
  }

  /**
   *
   */
  async updateAndGet(command: UpdateCommand): Promise<GetCommandResult> {
    const request: Request = { updateAndGet: command }
    const params = {
      s: this.sessionId,
      o: request,
    }
    const response: { body: GetCommandResult } = await fetch(this.url, {
      method: 'PUT',
      body: JSON.stringify(params)
    }).then(res => res.json())

    return response.body
  }

  /**
   *
   */
  async updateAndFetch(command: UpdateCommand): Promise<FetchCommandResult> {
    const request: Request = { updateAndFetch: command }
    const params = {
      s: this.sessionId,
      o: request,
    }
    const response: { body: FetchCommandResult } = await fetch(this.url, {
      method: 'PUT',
      body: JSON.stringify(params)
    }).then(res => res.json())

    return response.body
  }

  /**
   *
   */
  async delete(command: DeleteCommand): Promise<CommandResult> {
    const request: Request = { delete: command }
    const params = {
      s: this.sessionId,
      o: request,
    }
    const response: { body: CommandResult } = await fetch(this.url, {
      method: 'DELETE',
      body: JSON.stringify(params)
    }).then(res => res.json())

    return response.body
  }

  /**
   *
   */
  async runCustomQuery(query: CustomQuery): Promise<CustomQueryResult> {
    const request: Request = { runCustomQuery: query }
    const params = {
      s: this.sessionId,
      o: request,
    }
    const response: { body: CustomQueryResult } = await fetch(`${this.url}?d=${encodeURIComponent(JSON.stringify(params))}`, {
      method: 'GET',
    }).then(res => res.json())

    return response.body
  }

  /**
   *
   */
  async runCustomCommand(command: CustomCommand): Promise<CustomCommandResult> {
    const request: Request = { runCustomCommand: command }
    const params = {
      s: this.sessionId,
      o: request,
    }
    const response: { body: CustomCommandResult } = await fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(params)
    }).then(res => res.json())

    return response.body
  }
}
