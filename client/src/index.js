import React, { useEffect } from "react";
import ReactDOM from "react-dom";

import App from "./App";
import configureStore from "./store/store";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import { saveState } from "./localStorage";
import { Router } from "react-router";
const store = configureStore();

store.subscribe(() => {
  saveState(store.getState().currentUser);
  saveState(store.getState().login);
});
const history = createBrowserHistory();
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router history={history}>
        <Switch></Switch>
        <Route component={App} />
      </Router>
    </Provider>
  </React.StrictMode>,

  document.getElementById("root")
);
