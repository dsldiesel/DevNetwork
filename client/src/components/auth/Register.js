import React, { Fragment, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
// For connecting component with redux: (see bottom export too)
import { connect } from 'react-redux';
// To use this funcs, we declare at bottom export in second parameter's object
// and also add it in const below to use it inside (see connect docs)
import { setAlert } from '../../actions/alert';
import { register } from '../../actions/auth';
import PropTypes from 'prop-types';

const Register = ({ setAlert, register, isAuthed }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pass: '',
    pass2: ''
  });
  const { name, email, pass, pass2 } = formData;
  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmit = async e => {
    e.preventDefault();
    if (pass !== pass2) {
      setAlert('Passwords do not match', 'danger', 4000);
    } else {
      register({ name, email, pass });
    }
  };

  // Redirect if logged in
  if (isAuthed) {
    return <Redirect to='/dashboard' />;
  }

  return (
    <Fragment>
      <h1 className='large text-primary'>Sign Up</h1>
      <p className='lead'>
        <i className='fas fa-user' /> Create Your Account
      </p>
      <form className='form' onSubmit={e => onSubmit(e)}>
        <div className='form-group'>
          <input
            type='text'
            placeholder='Name'
            name='name'
            value={name}
            onChange={e => onChange(e)}
            required
          />
        </div>
        <div className='form-group'>
          <input
            type='email'
            placeholder='Email Address'
            name='email'
            value={email}
            onChange={e => onChange(e)}
            required
          />
          <small className='form-text'>
            This site uses Gravatar so if you want a profile image, use a
            Gravatar email
          </small>
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
        <div className='form-group'>
          <input
            type='password'
            placeholder='Confirm Password'
            name='pass2'
            value={pass2}
            onChange={e => onChange(e)}
            minLength='6'
            required
          />
        </div>
        <input type='submit' className='btn btn-primary' value='Register' />
      </form>
      <p className='my-1'>
        Already have an account? <Link to='/login'>Sign In</Link>
      </p>
    </Fragment>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthed: PropTypes.bool
};

const mapStateToProps = state => ({
  isAuthed: state.auth.isAuthed
});

export default connect(
  mapStateToProps,
  { setAlert, register }
)(Register);
