import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Response from "../components/OperationResult/Response";
import { State } from "../modules";

type Props = {
  loading: boolean;
  expanded: boolean;
  spent: number;
  response: any;
  error: any;
};

const mapStateToProps = (state: State): Props => ({
  expanded: true,
  spent: state.operation.spent,
  loading: state.operation.isFetching,
  response: state.operation.response,
  error: state.operation.error
});

// @ts-ignore: something wrong with react-router-dom
export default withRouter(connect(mapStateToProps)(Response));
