import { describe, it } from 'kocha'

import DynamoDBClient from '../src'
import type { RequestParameters } from '../decls/request-parameters.js.flow'

describe.skip('DynamoDBClient', function() {
  before(function() {
    this.dynamoDBClient = new DynamoDBClient()
  })

  it('find', async function() {
    const query = {
      entityName: 'user',
      where: { id: { $eq: 'user1' } },
      skip: 2,
      limit: 3,
      sort: { updatedAt: 1 },
    }
    const user1 = await this.dynamoDBClient.find(query)
    assert()
  })

  it('getRequestParametersByQuery', async function() {
    const query = {
      entityName: 'user',
      where: { id: { $eq: 'user1' } },
      skip: 2,
      limit: 3,
      sort: { updatedAt: 1 },
    }

    const requestParameters = getRequestParametersByQuery(query)
    const expectedParameters: RequestParameters = {
      TableName: 'user',
      KeyConditions: `{
        "id": {
          "ComparisonOperator":"EQ",
          "AttributeValueList": [ {"S": "user1"} ]
        }
      }`,
      Limit: 3,
      ScanIndexForward: true,
    }
    assert.deepEqual(requestParameters, expectedParameters)
  })
})