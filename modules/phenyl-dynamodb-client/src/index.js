// @flow

import AWS from 'aws-sdk'
import promisify from 'es6-promisify'
import type {
  CommandResult,
  DeleteCommand,
  FetchCommandResult,
  GetCommandResult,
  IdQuery,
  IdsQuery,
  InsertCommand,
  EntityClient,
  QueryResult,
  SingleQueryResult,
  UpdateCommand,
  WhereQuery,
  QueryCondition,
} from 'phenyl-interfaces'
import type { RequestParameters } from '../decls/request-parameters.js.flow'
import type { Response } from '../decls/response.js.flow'
import type { ExpressionAttributeValues } from '../decls/attribute-values.js.flow'
import type { ExpressionAttributeNames } from '../decls/attribute-names.js.flow'
import type { ComparisonOperator } from '../decls/request-parameters.js.flow'

export default class DynamoDBClient implements EntityClient {
  constructor() {
    this.dynamoDBClient = new AWS.DynamoDB.DocumentClient()
  }

  /**
   * request
   * @returns {Promise.<void>}
   */
  async request(params: RequestParameters): Promise<Response | Error> {
    const query = promisify(this.dynamoDBClient.query)
    const { err, data } = await query(params)
    if (err) return err
    return data
  }

  /**
   *
   */
  getComparisonOperator(queryConditionKey: $Keys<QueryCondition>): ComparisonOperator {
    switch(queryConditionKey) {
      case '$eq':
        return 'EQ'
      case '$ne':
        return 'NE'
      case '$lte':
        return 'LE'
      case '$lt':
        return 'LT'
      case '$gte':
        return 'GE'
      case '$gt':
        return 'GT'
      return 'NOT_NULL'
      return 'NULL'
      case '$nin':
        return 'NOT_CONTAINS'
      case '$in':
        return 'IN'
      case '$not':
      case '$exists':
      case '$type':
      case '$mod':
      case '$regex':
      case '$text':
      case '$where':
      case '$geoIntersects':
      case '$geoWithin':
      case '$near':
      case '$nearSphere':
      case '$all':
      case '$elemMatch':
      case '$size':
      case '$bitsAllClear':
      case '$bitsAllSet':
      case '$bitsAnyClear':
      case '$bitsAnySet':
        throw new Error(`${queryCondistionKey} to be implement`)
      default:
        throw new Error(`${queryConditionKey}`)
    }
  }

  /**
   *
   * @param query
   */
  getParamsByWhereQuery(query: WhereQuery): Params {
    const { entityName, where, skip, limit, sort } = query
    const params: RequestParameters = { TableName: entityName }
    const keyConditions = {}

    Object.keys(where).forEach(key => {
      keyConditions[key] = {
        ComparisonOperator: this.getComparisonOperator(where[key]),
        AttributeValueList: getAttributeValueList(key),
      }
    })

    if (skip) {} // 一度idのみを取得してLastEvaluatedKeyにいれてもう一度取得してそれを返す...
    if (sort) {
      if (Object.keys(sort).length > 1) {
        throw new Error('sort key length must be 1')
      }

      Object.keys(sort).forEach(key => {
        params.ScanIndexForward = sort[key] === 1 ? false : true
      })
    }
    if (limit) params.limit = limit

    params.ExpressionAttributeNames = expressionAttributeNames
    return params
  }

  /**
   *
   * @param query
   */
  find(query: WhereQuery): Promise<QueryResult> {
    return this.request(this.getParamsByWhereQuery(query))
  }

  /**
   *
   * @param query
   */
  async findOne(query: WhereQuery): Promise<SingleQueryResult> {
    return this.request(params)
  }

  /**
   *
   * @param query
   */
  async get(query: IdQuery): Promise<SingleQueryResult> {
    return this.request(params)
  }

  /**
   *
   * @param query
   */
  getByIds(query: IdsQuery): Promise<QueryResult> {
    return this.request(params)
  }

  /**
   *
   * @param command
   */
  insert(command: InsertCommand): Promise<CommandResult> {
    return this.request(params)
  }


  /**
   *
   * @param command
   */
  insertAndGet(command: InsertCommand): Promise<GetCommandResult> {
    return this.request(params)
  }

  /**
   *
   * @param command
   */
  insertAndFetch(command: InsertCommand): Promise<FetchCommandResult> {
    return this.request(params)
  }

  /**
   *
   * @param command
   */
  update(command: UpdateCommand): Promise<CommandResult> {
    return this.request(params)
  }

  /**
   *
   * @param command
   */
  updateAndGet(command: UpdateCommand): Promise<GetCommandResult> {
    return this.request(params)
  }

  /**
   *
   * @param command
   */
  updateAndFetch(command: UpdateCommand): Promise<FetchCommandResult> {
    return this.request(params)
  }

  /**
   *
   * @param command
   */
  delete(command: DeleteCommand): Promise<CommandResult> {
    return this.request(params)
  }
}