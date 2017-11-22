import React, { Component } from 'react'
import { Provider } from 'react-redux'
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'
import {
  Sidebar as SemanticSidebar,
  Segment,
  Divider,
} from 'semantic-ui-react'
import Sidebar from './containers/Sidebar'
import Breadcrumb from './containers/Breadcrumb'
import OperationEditor from './containers/OperationEditor'
import OperationResult from './containers/OperationResult'
import store from './modules'
import './App.css'

class Root extends Component {
  render () {
    return (
      <Provider store={store}>
        <Router basename='/explorer'>
          <App />
        </Router>
      </Provider>
    )
  }
}

class Home extends Component {
  render () {
    return (
      null
    )
  }
}
class Users extends Component {
  render () {
    return (
      <div>
        <Breadcrumb />
        <Divider horizontal>Settings</Divider>
        <OperationEditor />
        <Divider horizontal>Result</Divider>
        <OperationResult />
      </div>
    )
  }
}
class NonUsers extends Component {
  render () {
    return (
      <div>
        <Breadcrumb />
        <Divider horizontal>Settings</Divider>
        <OperationEditor />
        <Divider horizontal>Result</Divider>
        <OperationResult />
      </div>
    )
  }
}
class CustomQuery extends Component {
  render () {
    return (
      <div>
        <Breadcrumb />
        <Divider horizontal>Settings</Divider>
        <OperationEditor />
        <Divider horizontal>Result</Divider>
        <OperationResult />
      </div>
    )
  }
}
class CustomCommand extends Component {
  render () {
    return (
      <div>
        <Breadcrumb />
        <Divider horizontal>Settings</Divider>
        <OperationEditor />
        <Divider horizontal>Result</Divider>
        <OperationResult />
      </div>
    )
  }
}
class NotFound extends Component {
  render () {
    return (
      <div>
        <Breadcrumb />
        <Divider horizontal>Settings</Divider>
        <OperationEditor />
        <Divider horizontal>Result</Divider>
        <OperationResult />
      </div>
    )
  }
}

class App extends Component {
  render() {
    return (
      <SemanticSidebar.Pushable as={Segment} className="no-border">
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
  }
}

export default Root
