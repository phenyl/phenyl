import React, { Component } from 'react'
import { Form } from 'semantic-ui-react'

type Props = {
  match: any,
  isFetching: boolean,
  sessionId: string,
  execute: ({ name: string, params: Object }) => any,
}

type State = {
  params: string,
}

class OperationEditor extends Component<Props, State> {
  state: State = {
    params: null,
  }

  handleChangePayload = (event, { value }) => {
    this.setState({ params: value })
  }

  handleRun = () => {
    const { match, execute } = this.props
    const params = JSON.parse(this.state.params)
    execute({
      sessionId: this.props.sessionId,
      name: match.params.name,
      params,
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
