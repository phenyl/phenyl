// @flow

export type Payload = {
  type?: string,
  body: string,
  sound?: string,
  alert?: string,
}

export const notify = (os: string, deviceToken: string, payload: Payload) => {

}
