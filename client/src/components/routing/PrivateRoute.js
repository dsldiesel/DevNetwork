import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const PrivateRoute = ({
  component: Component,
  auth: { isAuthed, loading },
  ...rest
}) => (
  <Route
    {...rest}
    render={props =>
      !loading ? (
        !isAuthed ? (
          <Redirect to="/login" />
        ) : (
          <Component {...props} />
        )
      ) : (
        <div>Loading...</div> // Perhaps a loading component could be used here
      )
    }
  />
);

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired,
  component: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(PrivateRoute);
