// @flow

export function randomString(len: number = 24): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsLen = chars.length
  let ret = ''
  for(let i = 0; i < len; i++) {
    ret += chars[Math.floor(Math.random() * charsLen)];
  }
  return ret
}

export function randomStringWithTimeStamp(len: number = 24): string {
  const stamp = Date.now().toString()
  return randomString(Math.max(0, len - stamp.length)) + stamp
}
