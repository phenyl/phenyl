import React, { Component } from 'react'
import { Form } from 'semantic-ui-react'

type Props = {
  match: any,
  operations: Array<string>,
  defaultPayloads: { [string]: Object },
  execute: ({ entitiName: string, operation: string, payload: any }) => any,
}

type State = {
  operation: string, // FIXME: enum
  payload: Object,
}

class OperationEditor extends Component<Props, State> {
  state: State = {
    operation: null,
    payload: null,
  }

  handleChangeOperation = (event, { value }) => {
    if (!this.props.defaultPayloads[value]) {
      throw new Error(`Unknown operation: ${value}`)
    }

    const payload = this.props.defaultPayloads[value]

    this.setState({
      operation: value,
      payload: JSON.stringify(payload, null, 2),
    })
  }

  handleChangePayload = (event, { value }) => {
    this.setState({ payload: value })
  }

  handleRun = () => {
    const { match, execute } = this.props

    const payload = JSON.parse(this.state.payload)
    execute({
      sessionId: this.props.sessionId,
      entityName: match.params.functional,
      operation: this.state.operation,
      payload,
    })
  }

  componentDidMount() {
    const { operations, defaultPayload } = this.props

    this.handleChangeOperation(null, { value: operations[0] })
  }

  render () {
    const { operations, defaultPayload } = this.props
    return (
      <div>
        <Form>
          <Form.Group>
            <Form.Select
              label='Operation'
              options={operations.map(op => ({
                key: op,
                text: op,
                value: op,
              }))}
              defaultValue={operations[0]}
              onChange={this.handleChangeOperation}
            />
          </Form.Group>
          <Form.TextArea
            rows={4}
            label='Payload'
            value={this.state.payload}
            onChange={this.handleChangePayload}
          />
          <Form.Button
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
