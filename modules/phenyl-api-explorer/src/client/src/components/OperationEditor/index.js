import React, { Component } from 'react'
import { Form } from 'semantic-ui-react'

type Props = {
  match: any,
  operations: Array<string>,
  defaultPayload: string,
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
    this.setState({ operation: value })
  }

  handleChangePayload = (event, { value }) => {
    this.setState({ payload: value })
  }

  handleRun = () => {
    const { match, execute } = this.props

    const payload = JSON.parse(this.state.payload)
    execute({
      entityName: match.params.functional,
      operation: this.state.operation,
      payload,
    })
  }

  componentWillMount() {
    const { operations, defaultPayload } = this.props

    this.handleChangeOperation(null, { value: operations[0] })
    this.handleChangePayload(null, { value: JSON.stringify(defaultPayload, null, 2) })
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
            label='Payload'
            defaultValue={JSON.stringify(defaultPayload, null, 2)}
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
