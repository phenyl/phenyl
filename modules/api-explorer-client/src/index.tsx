import { Component } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import store from "./modules";
import App from "./App";
import "./index.css";

class Root extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router basename="/explorer">
          <App />
        </Router>
      </Provider>
    );
  }
}

ReactDOM.render(<Root />, document.getElementById("root"));
