// @ts-ignore TODO Upgrade react to v17 and remove imports of react
import React from "react";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { Sidebar as SemanticSidebar, Menu } from "semantic-ui-react";
import { connect } from "react-redux";
import Information from "../components/Sidebar/Information";
import FunctionalGroup from "../components/Sidebar/FunctionalGroup";
import { logout } from "../modules/user";
import { State } from "../modules";
import pkg from "../../package.json";

const { PhenylFunctionalGroupSkeleton } = window.phenylApiExplorerClientGlobals;

type Props = {
  version: string;
  userName?: string;
  logout: () => void;
};

export const Sidebar = ({ version, userName, logout }: Props) => (
  <SemanticSidebar
    as={Menu}
    visible
    icon="labeled"
    vertical
    inverted
    className="fixed"
  >
    <Information version={version} userName={userName} onLogout={logout} />
    <FunctionalGroup
      groupName={"users"}
      // @ts-ignore: global PhenylFunctionalGroupSkeleton
      functionalNames={Object.keys(PhenylFunctionalGroupSkeleton.users)}
    />
    <FunctionalGroup
      groupName={"nonUsers"}
      // @ts-ignore: global PhenylFunctionalGroupSkeleton
      functionalNames={Object.keys(PhenylFunctionalGroupSkeleton.nonUsers)}
    />
    <FunctionalGroup
      groupName={"customQueries"}
      // @ts-ignore: global PhenylFunctionalGroupSkeleton
      functionalNames={Object.keys(PhenylFunctionalGroupSkeleton.customQueries)}
    />
    <FunctionalGroup
      groupName={"customCommands"}
      functionalNames={Object.keys(
        // @ts-ignore: global PhenylFunctionalGroupSkeleton
        PhenylFunctionalGroupSkeleton.customCommands
      )}
    />
  </SemanticSidebar>
);

const mapStateToProps = (
  state: State
): { version: string; userName: string | null | undefined } => {
  let displayName = null;
  if (state.user.anonymous) {
    displayName = "(anonymous)";
  } else if (state.user.session) {
    displayName = state.user.displayName;
  }

  return {
    version: pkg.version,
    userName: displayName,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, Action>) => ({
  logout() {
    dispatch(logout());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
