import uuid from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './constants';

// Thunk middleware allows next dispatch
export const setAlert = (msg, alertType, timeout = 4000) => dispatch => {
  const id = uuid.v4();
  dispatch({
    type: SET_ALERT,
    payload: {
      id,
      msg,
      alertType
    }
  });
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
