// @flow

export function randomString(len: number = 24): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charsLen = chars.length
  let ret = ''
  for(let i = 0; i < len; i++) {
    ret += chars[Math.floor(Math.random() * charsLen)]
  }
  return ret
}

function padZero(s: string, len: number): string {
  let str = s
  while (str.length < len) {
    str = '0' + str
  }
  return str
}

export function randomStringWithTimeStamp(len: number = 24): string {
  const stamp = Date.now().toString(36)
  return randomString(Math.max(0, len - stamp.length))
}

// Enable Lexicographical order
export function timeStampWithRandomString(len: number = 24): string {
  const stamp09 = padZero(Date.now().toString(36), 9) // Lexicographical until 5188-04-22
  return stamp09 + randomString(Math.max(0, len - stamp09.length))
}
