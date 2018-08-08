// @flow
import shajs from 'sha.js'

export type PowerCryptOptions = $Shape<{
  nStretch: number,
  algorithm: 'sha224' | 'sha256' | 'sha384' | 'sha384' | 'sha512',
  encode: 'hex' | 'utf8' | 'base64',
  salt: string
}>

/**
 *
 */
export default function powerCrypt(str: string, options?: PowerCryptOptions = {}): string {
  let { nStretch, algorithm, encode, salt } = options
  salt = salt || ''
  encode = encode || 'base64'
  algorithm = algorithm || 'sha256'
  nStretch = Math.max(nStretch || 1000, 1)

  let i = 0
  let buf: any = str + salt
  const hashFn = shajs(algorithm)
  while (i < nStretch) {
    buf = hashFn.update(buf).digest()
    i++
  }
  return buf.toString(encode)
}
