import { assign } from 'power-assign/jsnext'
import { Entity, ResponseData } from 'phenyl-interfaces'
export type EntityVisitor = (entity: Entity) => Entity
/**
 *
 */

export function visitEntitiesInResponseData(resData: ResponseData, visitor: EntityVisitor): ResponseData {
  switch (resData.type) {
    case 'get':
    case 'findOne':
    case 'insertAndGet':
    case 'updateAndGet': {
      const newEntity = visitor(resData.payload.entity)
      if (newEntity === resData.payload.entity) return resData
      return assign(resData, {
        'payload.entity': newEntity,
      })
    }

    case 'getByIds':
    case 'find':
    case 'insertAndGetMulti':
    case 'updateAndFetch': {
      const newEntities = resData.payload.entities.map(visitor)
      return assign(resData, {
        'payload.entities': newEntities,
      })
    }

    case 'pull':
    case 'push': {
      if (resData.payload.entity == null) return resData
      const newEntity = visitor(resData.payload.entity)
      if (newEntity === resData.payload.entity) return resData
      return assign(resData, {
        'payload.entity': newEntity,
      })
    }

    case 'login': {
      if (resData.payload.user == null) return resData
      const newUser = visitor(resData.payload.user)
      if (newUser === resData.payload.user) return resData
      return assign(resData, {
        'payload.user': newUser,
      })
    }

    case 'insertOne':
    case 'insertMulti':
    case 'updateById':
    case 'updateMulti':
    case 'delete':
    case 'logout': {
      return resData
    }

    default:
      return resData
  }
}
