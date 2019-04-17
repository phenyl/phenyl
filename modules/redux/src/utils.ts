import deepEqual from "fast-deep-equal";
export function removeOne(arr: Array<any>, element: any): Array<any> {
  let idx = arr.length - 1;

  for (const el of arr.slice().reverse()) {
    if (deepEqual(el, element)) {
      break;
    }

    idx--;
  }

  if (idx < 0) {
    return arr;
  }

  const ret = arr.slice();
  ret.splice(idx, 1);
  return ret;
}
