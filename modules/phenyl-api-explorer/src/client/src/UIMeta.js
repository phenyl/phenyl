// UI meta
export const operations = [
  {
    name: 'find',
    description: 'TBD',
    tags: ['query'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      where: [],
      limit: 5,
    },
  },
  {
    name: 'findOne',
    description: 'TBD',
    tags: ['query'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      where: [],
    },
  },
  {
    name: 'get',
    description: 'TBD',
    tags: ['query'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      id: 0,
    },
  },
  {
    name: 'getByIds',
    description: 'TBD',
    tags: ['query'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      ids: [0],
    },
  },
  {
    name: 'pull',
    description: 'TBD',
    tags: ['query'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      id: 0,
      versionId: 0,
    },
  },
  {
    name: 'insertOne',
    description: 'TBD',
    tags: ['command'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      value: {},
    },
  },
  {
    name: 'insertMulti',
    description: 'TBD',
    tags: ['command'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      values: [
        {},
      ]
    },
  },
  {
    name: 'insertAndGet',
    description: 'TBD',
    tags: ['command'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      value: {},
    },
  },
  {
    name: 'insertAndGetMulti',
    description: 'TBD',
    tags: ['command'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      values: [
        {},
      ]
    },
  },
  {
    name: 'updateById',
    description: 'TBD',
    tags: ['command'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      id: 0,
      operation: {
        $set: {
          xxx: 0,
        }
      }
    },
  },
  {
    name: 'updateMulti',
    description: 'TBD',
    tags: ['command'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      where: [],
      operation: {
        $set: {
          xxx: 0,
        }
      },
    },
  },
  {
    name: 'updateAndGet',
    description: 'TBD',
    tags: ['command'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      id: 0,
      operation: {
        $set: {
          xxx: 0,
        }
      }
    },
  },
  {
    name: 'updateAndFetch',
    description: 'TBD',
    tags: ['command'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      where: [],
      operation: {
        $set: {
          xxx: 0,
        }
      },
    },
  },
  {
    name: 'push',
    description: 'TBD',
    tags: ['command'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      id: 0,
      operations: [
        {
          $set: {
            xxx: 0,
          }
        }
      ],
      versionId: 0,
    },
  },
  {
    name: 'delete',
    description: 'TBD',
    tags: ['command'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      id: 0,
    },
  },
  {
    name: 'login',
    description: 'TBD',
    tags: ['command', 'users'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      credentials: {}
    },
  },
  {
    name: 'logout',
    description: 'TBD',
    tags: ['command', 'users'],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      userId: 0,
    },
  },
]
