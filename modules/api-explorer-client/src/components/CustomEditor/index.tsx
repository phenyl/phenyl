import { Component } from "react";
import { Form } from "semantic-ui-react";

type Id = string;

type Props = {
  match: any;
  isFetching: boolean;
  sessionId: Id;
  execute: (params: { sessionId: Id; name: string; params: string }) => any;
};

type State = {
  params: string;
};

class OperationEditor extends Component<Props, State> {
  state: State = {
    params: "",
  };

  handleChangePayload = (event: any, { value }: { value: string }) => {
    this.setState({ params: value });
  };

  handleRun = () => {
    const { match, execute } = this.props;

    execute({
      sessionId: this.props.sessionId,
      name: match.params.name,
      params: this.state.params,
    });
  };

  render() {
    const { isFetching } = this.props;
    return (
      <div>
        <Form>
          <Form.TextArea
            disabled={isFetching}
            rows={4}
            label="Payload"
            value={this.state.params}
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
