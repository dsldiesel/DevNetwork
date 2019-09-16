import React, { Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NavBar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Routes from './components/routing/Routes';
import { loadUser, noToken } from './actions/auth';
// Redux
import { Provider } from 'react-redux';
import store from './store';

import './App.css';

const App = () => {
  useEffect(() => {
    // This will also make menu load!
    if (localStorage.token) {
      store.dispatch(loadUser());
    } else {
      store.dispatch(noToken());
    }
  }, []);
  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <NavBar />
          <Switch>
            <Route exact path="/" component={Landing} />
            <Route component={Routes} />
          </Switch>
          {/* All pages will have a container class, except landing, so we separate it */}
        </Fragment>
      </Router>
    </Provider>
  );
};

export default App;
