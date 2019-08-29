import React, { Fragment, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
// For connecting component with redux: (see bottom export too)
import { connect } from 'react-redux';
// To use this funcs, we declare at bottom export in second parameter's object
// and also add it in const below to use it inside (see connect docs)
import { setAlert } from '../../actions/alert';
import { login } from '../../actions/auth';
import PropTypes from 'prop-types';

// @TODO: not using setAlert here so far, remove?
const Login = ({ setAlert, login, isAuthed }) => {
  const [formData, setFormData] = useState({
    email: '',
    pass: ''
  });
  const { email, pass } = formData;
  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmit = async e => {
    e.preventDefault();
    login({ email, pass });
  };

  // Redirect if logged in
  if (isAuthed) {
    return <Redirect to='/dashboard' />;
  }

  return (
    <Fragment>
      <h1 className='large text-primary'>Sign In</h1>
      <p className='lead'>
        <i className='fas fa-user' /> Login to your Account
      </p>
      <form className='form' onSubmit={e => onSubmit(e)}>
        <div className='form-group'>
          <input
            type='email'
            placeholder='Email Address'
            name='email'
            value={email}
            onChange={e => onChange(e)}
            required
          />
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Password'
            name='pass'
            value={pass}
            onChange={e => onChange(e)}
            minLength='6'
            required
          />
        </div>
        <input type='submit' className='btn btn-primary' value='Login' />
      </form>
      <p className='my-1'>
        Don't have an account? <Link to='/register'>Sign Up</Link>
      </p>
    </Fragment>
  );
};

Login.propTypes = {
  setAlert: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  isAuthed: PropTypes.bool
};

const mapStateToProps = state => ({
  isAuthed: state.auth.isAuthed
});

export default connect(
  mapStateToProps,
  { setAlert, login }
)(Login);
