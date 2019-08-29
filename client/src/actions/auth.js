import axios from 'axios';
import { setAlert } from './alert';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT
} from '../actions/constants';
import setAuthToken from '../utils/setAuthToken';

// Load user
export const loadUser = () => async dispatch => {
  // Always send the token if found in storage. It will be added here, and then checked by middleware, plus send user back
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    const res = await axios.get('/api/auth');
    dispatch({
      type: USER_LOADED,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR
    });
  }
};

// Login user
export const login = ({ email, pass }) => async dispatch => {
  const user = {
    email,
    pass
  };
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const body = JSON.stringify(user);

  try {
    const res = await axios.post('/api/auth', body, config);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data
    });
    // Also dispatch the LOAD_USER
    dispatch(loadUser());
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: LOGIN_FAIL
    });
  }
};

// Register user
export const register = ({ name, email, pass }) => async dispatch => {
  const newUser = {
    name,
    email,
    pass
  };
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const body = JSON.stringify(newUser);

  try {
    const res = await axios.post('/api/users', body, config);
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data
    });
    // Also dispatch the LOAD_USER
    dispatch(loadUser());
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: REGISTER_FAIL
      // No payload needed, reducer does the stuff
    });
  }
};

// Logout user
export const logout = () => dispatch => {
  dispatch({
    type: LOGOUT
  });
};
