import { ObjectMap } from "./utils";

export type ExtraParams = ObjectMap;
export type ExtraResult = ObjectMap;

export type CustomResultObject = ObjectMap & { extra?: undefined };
export type CustomQueryResultObject = CustomResultObject;
export type CustomCommandResultObject = CustomResultObject;
