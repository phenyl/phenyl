import React, { Component } from "react";
import { Form } from "semantic-ui-react";

type Props = {
  match: any;
  isFetching: boolean;
  sessionId: string;
  operations: Array<string>;
  defaultPayloads: { [key: string]: Object };
  execute: (
    params: {
      sessionId: string;
      entityName: string;
      method: string;
      payload: string;
    }
  ) => any;
};

type State = {
  method: string;
  payload: string;
};

class OperationEditor extends Component<Props, State> {
  state: State = {
    method: "",
    payload: ""
  };

  handleChangeOperation = (event: any, { value }: { value: string }) => {
    if (!this.props.defaultPayloads[value]) {
      throw new Error(`Unknown method: ${value}`);
    }

    const payload = this.props.defaultPayloads[value];

    this.setState({
      method: value,
      payload: JSON.stringify(payload, null, 2)
    });
  };

  handleChangePayload = (event: any, { value }: { value: string }) => {
    this.setState({ payload: value });
  };

  handleRun = () => {
    const { match, execute } = this.props;

    execute({
      sessionId: this.props.sessionId,
      entityName: match.params.entityName,
      method: this.state.method,
      payload: this.state.payload
    });
  };

  componentDidMount() {
    const { operations } = this.props;

    this.handleChangeOperation(null, { value: operations[0] });
  }

  render() {
    const { operations, isFetching } = this.props;
    return (
      <div>
        <Form>
          <Form.Group>
            <Form.Select
              disabled={isFetching}
              label="Operation"
              options={operations.map(op => ({
                key: op,
                text: op,
                value: op
              }))}
              defaultValue={operations[0]}
              onChange={this.handleChangeOperation}
            />
          </Form.Group>
          <Form.TextArea
            disabled={isFetching}
            rows={4}
            label="Payload"
            value={this.state.payload}
            onChange={this.handleChangePayload}
          />
          <Form.Button disabled={isFetching} positive onClick={this.handleRun}>
            Run
          </Form.Button>
        </Form>
      </div>
    );
  }
}

export default OperationEditor;
