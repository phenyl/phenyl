import React from "react";
import { connect } from "react-redux";
import { withRouter, Route, Switch } from "react-router-dom";
import {
  Sidebar as SemanticSidebar,
  Segment,
  Divider
} from "semantic-ui-react/index";
import LoginModal from "./containers/LoginModal";
import Sidebar from "./containers/Sidebar";
import Breadcrumb from "./containers/Breadcrumb";
import OperationEditor from "./containers/OperationEditor";
import OperationResult from "./containers/OperationResult";
import CustomQueryEditor from "./containers/CustomQueryEditor";
import CustomCommandEditor from "./containers/CustomCommandEditor";
import { State } from "./modules";
import "./App.css";

const Home = () => null;
const Users = () => (
  <div>
    <Breadcrumb />
    <Divider horizontal>Settings</Divider>
    <OperationEditor />
    <Divider horizontal>Result</Divider>
    <OperationResult />
  </div>
);
const NonUsers = () => (
  <div>
    <Breadcrumb />
    <Divider horizontal>Settings</Divider>
    <OperationEditor />
    <Divider horizontal>Result</Divider>
    <OperationResult />
  </div>
);
const CustomQuery = () => (
  <div>
    <Breadcrumb />
    <Divider horizontal>Settings</Divider>
    <CustomQueryEditor />
    <Divider horizontal>Result</Divider>
    <OperationResult />
  </div>
);
const CustomCommand = () => (
  <div>
    <Breadcrumb />
    <Divider horizontal>Settings</Divider>
    <CustomCommandEditor />
    <Divider horizontal>Result</Divider>
    <OperationResult />
  </div>
);
const NotFound = () => (
  <div>
    <span>Not found</span>
  </div>
);

type Props = {
  mustLogin: boolean;
};

const App = ({ mustLogin }: Props) => (
  <SemanticSidebar.Pushable as={Segment} className="no-border">
    <LoginModal open={mustLogin} />
    <Sidebar />
    <SemanticSidebar.Pusher style={{ maxWidth: window.outerWidth - 260 - 20 }}>
      <Segment basic className="no-border">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/users/:entityName" component={Users} />
          <Route path="/nonUsers/:entityName" component={NonUsers} />
          <Route path="/customQueries/:name" component={CustomQuery} />
          <Route path="/customCommands/:name" component={CustomCommand} />
          <Route component={NotFound} />
        </Switch>
      </Segment>
    </SemanticSidebar.Pusher>
  </SemanticSidebar.Pushable>
);

const mapStateToProps = (state: State) => ({
  mustLogin: !state.user.anonymous && !state.user.session
});

// @ts-ignore something wrong with withRouter
export default withRouter(connect(mapStateToProps)(App));
