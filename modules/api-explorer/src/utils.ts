import fs from "fs";
import path from "path";

export function shallowMap(
  obj: { [key: string]: any } | undefined | null,
  fn: (a: any, b: string, c: Object) => any
): Object {
  if (!obj) {
    return {};
  }

  const ret: { [key: string]: any } = {};

  for (let p in obj) {
    ret[p] = fn(obj[p], p, obj);
  }

  return ret;
}
export const pkgDir = (name: string): string => {
  const dir = (require.resolve.paths(name) || []).find(p =>
    fs.existsSync(path.join(p, name, "package.json"))
  );

  if (!dir) {
    throw new Error(`Cannot find ${name}`);
  }

  return path.join(dir, name);
};
