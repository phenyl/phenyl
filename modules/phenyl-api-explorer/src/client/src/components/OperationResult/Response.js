import React from 'react'
import { Segment, Message } from 'semantic-ui-react'
import JSONTree from 'react-json-tree'

type Props = {
  loading: boolean,
  expanded: boolean,
  response: any,
  error: ?Error,
}

const Response = ({ loading, expanded, response, error }: Props) => {
  if (loading) {
    return (
      <Segment loading className='result' />
    )
  } else if (error != null) {
    return (
      <Segment className='result'>
        <Message negative>
          <Message.Header>{error.message}</Message.Header>
          <pre>{error.stack}</pre>
        </Message>
      </Segment>
    )
  } else if (response != null) {
    return (
      <Segment className='result'>
        <JSONTree
          hideRoot
          sortObjectKeys
          shouldExpandNode={() => expanded}
          data={response}
        />
      </Segment>
    )
  }

  return null
}

export default Response
