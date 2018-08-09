import React, { Component } from 'react'
import { Form } from 'semantic-ui-react'

type Props = {
  match: any,
  isFetching: boolean,
  sessionId: string,
  execute: ({ name: string, params: string }) => any,
}

type State = {
  params: string,
}

class OperationEditor extends Component<Props, State> {
  state: State = {
    params: '',
  }

  handleChangePayload = (event, { value }) => {
    this.setState({ params: value })
  }

  handleRun = () => {
    const { match, execute } = this.props

    execute({
      sessionId: this.props.sessionId,
      name: match.params.name,
      params: this.state.params,
    })
  }

  render () {
    const { isFetching } = this.props
    return (
      <div>
        <Form>
          <Form.TextArea
            disabled={isFetching}
            rows={4}
            label='Payload'
            value={this.state.params}
            onChange={this.handleChangePayload}
          />
          <Form.Button
            disabled={isFetching}
            positive
            onClick={this.handleRun}
          >
            Run
          </Form.Button>
        </Form>
      </div>
    )
  }
}

export default OperationEditor
