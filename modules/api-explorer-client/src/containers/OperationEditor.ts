import { Action } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import OperationEditor from "../components/OperationEditor";
import { operations } from "../UIMeta";
import { execute } from "../modules/operation";
import { State } from "../modules";

const mapStateToProps = (state: State) => ({
  sessionId: state.user.session ? state.user.session.id : null,
  isFetching: state.operation.isFetching,
  operations: operations.map(op => op.name),
  defaultPayloads: operations.reduce(
    (acc, op) => ({
      ...acc,
      [op.name]: op.defaultPayload
    }),
    {}
  )
});

const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, Action>) => ({
  execute(params: {
    sessionId: string;
    entityName: string;
    method: string;
    payload: string;
  }) {
    dispatch(execute(params));
  }
});

export default withRouter(
  // @ts-ignore: something wrong with react-router-dom
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(OperationEditor)
);
