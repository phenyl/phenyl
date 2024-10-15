import { Collection, MongoClient, MongoClientOptions } from "mongodb";

export interface MongoDbConnection {
  close(): void;
  collection(entityName: string): Collection;
}

export async function connect(
  url: string,
  dbName: string,
  mongoClientOptions?: MongoClientOptions
): Promise<MongoDbConnection> {
  const dbClient = new MongoClient(url, mongoClientOptions);
  await dbClient.connect();
  return new PhenylMongoDbConnection({ dbClient, dbName });
}

export function close(db: MongoDbConnection): void {
  db.close();
}

type PhenylMongoDbConnectionParams = {
  dbClient: MongoClient;
  dbName: string;
  collections?: {
    [entityName: string]: Collection;
  };
};

export class PhenylMongoDbConnection implements MongoDbConnection {
  dbClient: MongoClient;
  dbName: string;
  collections: {
    [entityName: string]: Collection;
  };

  constructor(params: PhenylMongoDbConnectionParams) {
    this.dbClient = params.dbClient;
    this.dbName = params.dbName;
    this.collections = params.collections || {};
  }

  collection(entityName: string): Collection {
    if (this.collections[entityName] == null) {
      const coll = this.dbClient.db(this.dbName).collection(entityName);
      this.collections[entityName] = coll;
    }
    return this.collections[entityName];
  }

  close(): void {
    this.dbClient.close();
  }
}
