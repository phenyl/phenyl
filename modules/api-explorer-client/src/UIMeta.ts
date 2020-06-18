// UI meta
export const operations = [
  {
    name: "find",
    description: "TBD",
    tags: ["query"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      where: {},
      limit: 5,
    },
  },
  {
    name: "findOne",
    description: "TBD",
    tags: ["query"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      where: {},
    },
  },
  {
    name: "get",
    description: "TBD",
    tags: ["query"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      id: "",
    },
  },
  {
    name: "getByIds",
    description: "TBD",
    tags: ["query"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      ids: [""],
    },
  },
  {
    name: "pull",
    description: "TBD",
    tags: ["query"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      id: "",
      versionId: "",
    },
  },
  {
    name: "insertOne",
    description: "TBD",
    tags: ["command"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      value: {},
    },
  },
  {
    name: "insertMulti",
    description: "TBD",
    tags: ["command"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      values: [{}],
    },
  },
  {
    name: "insertAndGet",
    description: "TBD",
    tags: ["command"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      value: {},
    },
  },
  {
    name: "insertAndGetMulti",
    description: "TBD",
    tags: ["command"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      values: [{}],
    },
  },
  {
    name: "updateById",
    description: "TBD",
    tags: ["command"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      id: "",
      operation: {
        xxx: 0,
      },
    },
  },
  {
    name: "updateMulti",
    description: "TBD",
    tags: ["command"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      where: {},
      operation: {
        xxx: 0,
      },
    },
  },
  {
    name: "updateAndGet",
    description: "Updates a node of given id, and returns the updated node.",
    tags: ["command"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      id: "",
      operation: {
        xxx: 0,
      },
    },
  },
  {
    name: "updateAndFetch",
    description:
      "Update multiple node that matches the where query, and returns the updated nodes.",
    tags: ["command"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      where: {},
      operation: {
        xxx: 0,
      },
    },
  },
  {
    name: "push",
    description: "TBD",
    tags: ["command"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      id: "",
      operations: [
        {
          xxx: 0,
        },
      ],
      versionId: "",
    },
  },
  {
    name: "delete",
    description: "TBD",
    tags: ["command"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      id: "",
    },
  },
  {
    name: "login",
    description: "TBD",
    tags: ["command", "users"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      credentials: {},
    },
  },
  {
    name: "logout",
    description: "TBD",
    tags: ["command", "users"],
    payload: true,
    availableOnHttp: true,
    // availableOnWebsocket: false,
    defaultPayload: {
      userId: "",
    },
  },
];
