import { Action } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import { Id } from "@phenyl/interfaces";
import CustomEditor from "../components/CustomEditor";
import { runCustomCommand } from "../modules/operation";
import { State } from "../modules";

const mapStateToProps = (state: State) => ({
  sessionId: state.user.session ? state.user.session.id : null,
  isFetching: state.operation.isFetching
});

const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, Action>) => ({
  execute({ sessionId, name, params }) {
    dispatch(runCustomCommand({ sessionId, name, params }));
  }
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CustomEditor)
);
