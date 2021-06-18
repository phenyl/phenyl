import { ObjectMap } from "./utils";

export type ExtraParams = ObjectMap;
export type ExtraResult = ObjectMap;

export type CustomResultObject = ObjectMap & { extra?: ExtraParams };
export type CustomQueryResultObject = CustomResultObject;
export type CustomCommandResultObject = CustomResultObject;
