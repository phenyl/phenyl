// @flow

export type QueryCondition = {
  // comparison
  $eq?: any,
  $gt?: any,
  $gte?: any,
  $in?: Array<any>,
  $lt?: any,
  $lte?: any,
  $ne?: any,
  $nin?: Array<any>,
  // logical
  $and?: Array<QueryExpression>,
  $not?: QueryCondition,
  $nor?: Array<QueryExpression>,
  $or?: Array<QueryExpression>,
  // element
  $exists?: boolean,
  $type?: number,
  // evaluation
  $mod?: [number, number],
  $regex?: RegExp,
  $text?: TextQueryCondition,
  $where?: Function, // To Be Implemented
  // geospatial
  $geoIntersects?: Object, // To Be Implemented
  $geoWithin?: Object, // To Be Implemented
  $near?: Object, // To Be Implemented
  $nearSphere?: Object, // To Be Implemented
  // array
  $all?: Array<any>,
  $elemMatch?: QueryCondition,
  $size?: number,
  // bitwise
  $bitsAllClear?: number, // Currently, only number is allowed
  $bitsAllSet?: number, // Currently, only number is allowed
  $bitsAnyClear?: number, // Currently, only number is allowed
  $bitsAnySet?: number, // Currently, only number is allowed
  // comments
  // $comment: // No implementation
}

type DotNotationString = string

type QueryExpression = {
  [field: DotNotationString]: QueryCondition
}

type TextQueryCondition = {
  $search?: string,
  $language?: string,
  $caseSensitive?: boolean,
  $diacriticSensitive: boolean,
}

/**
 *
 */
export default class QueryOperation {
  /**
   *
   */
  static findInArrayByQuery(arr: Array<any>, q: any | QueryCondition) {
    const query = this.normalizeQuery(q)

    const operatorNames = Object.keys(query)

    for (const operatorName of operatorNames) {
      switch (operatorName) {
        case '$eq':
      }
    }

    return arr // To Be implemented
  }

  /**
   *
   */
  static normalizeQuery(q: any | QueryCondition): QueryCondition {
    if (q == null || typeof q !== 'object') {
      return {}
    }
    if (Object.keys(q)[0].charAt(0) !== '$') {
      return { $eq: q }
    }
    return q
  }
}
