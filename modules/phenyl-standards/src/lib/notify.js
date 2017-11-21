// @flow
import fetch from 'node-fetch'

const ONE_SIGNAL_API_URL = 'https://onesignal.com/api/v1/notifications'

export type Payload = {
  type?: string,
  contents: { [language: string]: string },
  sound?: string,
}

export const notify = async (appId: string, payload: Payload): Promise<any> => {
  // $FlowIssue(contains contents)
  const body = Object.assign({
    app_id: appId,
    included_segments: ['All'], // TODO
  }, payload)

  const result = await fetch(
    ONE_SIGNAL_API_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charaset=utf-8',
        Authorization: 'Basic dummy'
      },
      body: JSON.stringify(body)
    }
  )
  return result
}
