// @flow
import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Route, Switch } from 'react-router-dom'
import {
  Sidebar as SemanticSidebar,
  Segment,
  Divider,
} from 'semantic-ui-react'
import LoginModal from './containers/LoginModal'
import Sidebar from './containers/Sidebar'
import Breadcrumb from './containers/Breadcrumb'
import OperationEditor from './containers/OperationEditor'
import OperationResult from './containers/OperationResult'
import './App.css'

const Home = () => (
  null
)
const Users = () => (
  <div>
    <Breadcrumb />
    <Divider horizontal>Settings</Divider>
    <OperationEditor />
    <Divider horizontal>Result</Divider>
    <OperationResult />
  </div>
)
const NonUsers = () => (
  <div>
    <Breadcrumb />
    <Divider horizontal>Settings</Divider>
    <OperationEditor />
    <Divider horizontal>Result</Divider>
    <OperationResult />
  </div>
)
const CustomQuery = () => (
  <div>
    <Breadcrumb />
    <Divider horizontal>Settings</Divider>
    <OperationEditor />
    <Divider horizontal>Result</Divider>
    <OperationResult />
  </div>
)
const CustomCommand = () => (
  <div>
    <Breadcrumb />
    <Divider horizontal>Settings</Divider>
    <OperationEditor />
    <Divider horizontal>Result</Divider>
    <OperationResult />
  </div>
)
const NotFound = () => (
  <div>
    <Breadcrumb />
    <Divider horizontal>Settings</Divider>
    <OperationEditor />
    <Divider horizontal>Result</Divider>
    <OperationResult />
  </div>
)

type Props = {
  mustLogin: boolean
}

const App = ({ mustLogin }: Props) => (
  <SemanticSidebar.Pushable as={Segment} className="no-border">
    <LoginModal open={mustLogin} />
    <Sidebar />
    <SemanticSidebar.Pusher style={{ maxWidth: window.outerWidth - 260 - 20 }}>
      <Segment basic className="no-border">
        <Switch>
          <Route exact path='/' component={Home} />
          <Route path='/users/:functional' component={Users} />
          <Route path='/nonUsers/:functional' component={NonUsers} />
          <Route path='/customQuery/:functional' component={CustomQuery} />
          <Route path='/customCommand/:functional' component={CustomCommand} />
          <Route component={NotFound} />
        </Switch>
      </Segment>
    </SemanticSidebar.Pusher>
  </SemanticSidebar.Pushable>
)

const mapStateToProps = (state) => ({
  mustLogin: !state.user.anonymous && !state.user.session
})

export default withRouter(connect(mapStateToProps)(App))
