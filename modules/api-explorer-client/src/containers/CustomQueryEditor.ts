import { Action } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import CustomEditor from "../components/CustomEditor";
import { runCustomQuery } from "../modules/operation";
import { State } from "../modules";

const mapStateToProps = (state: State) => ({
  sessionId: state.user.session ? state.user.session.id : null,
  isFetching: state.operation.isFetching
});

const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, Action>) => ({
  execute(_params: { sessionId: string; name: string; params: string }) {
    dispatch(runCustomQuery(_params));
  }
});

export default withRouter(
  // @ts-ignore: something wrong with react-router-dom
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CustomEditor)
);
