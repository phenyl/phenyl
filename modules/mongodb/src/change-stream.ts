export type ChangeStreamPipeline = Object
export type ChangeStreamOptions = {
  fullDocument?: string,
  resumeAfter?: Object,
  maxAwaitTimeMS?: number,
  batchSize?: number,
  collation?: Object,
}

export type ChangeEventId = {
  _data: Object,
}

export interface BasicChangeEvent {
  _id: ChangeEventId,
  ns: {
    db: string,
    coll: string,
  },
  documentKey?: { _id: string },
}

export interface UpdateChangeEvent extends BasicChangeEvent {
  operationType: 'update',
  updateDescription: {
    updatedFields: { [docPath: string]: any },
    removedFields: Array<string>
  },
}

export interface InsertChangeEvent extends BasicChangeEvent {
  operationType: 'replace' | 'delete' | 'invalidate',
  fullDocument: Object,
}

export interface StandardChangeEvent extends BasicChangeEvent {
  operationType: 'replace' | 'delete' | 'invalidate',
}

export type ChangeEvent = UpdateChangeEvent | StandardChangeEvent


export interface ChangeStream {
  next(fn: (err: Error | null | undefined, evt: ChangeEvent) => any): any,
  close(): any,
}
