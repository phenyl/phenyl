import React, { Component } from 'react'
import { Provider } from 'react-redux'
import {
  BrowserRouter as Router,
  Route,
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
        <Router>
          <Route component={App} />
        </Router>
      </Provider>
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
            <Breadcrumb />
            <Divider horizontal>Settings</Divider>
            <OperationEditor />
            <Divider horizontal>Result</Divider>
            <OperationResult />
          </Segment>
        </SemanticSidebar.Pusher>
      </SemanticSidebar.Pushable>
    )
  }
}

export default Root
