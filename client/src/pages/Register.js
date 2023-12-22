// Register.js

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from "react-router-dom";
import bgImg from '../assets/logo.svg';
import '../styles/formStyles.css';
import SpinnerComponent from '../components/spinnerComponent';
import Home from './Home';

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!) {
    registerUser(email: $email, password: $password) {
      id
      email
    }
  }
`;

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useNavigate();

  const [registerUser] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      console.log('User registered successfully!', data);
      router("/home?registration=success");
    },
    onError: (error) => {
      console.error('Registration error:', error.message);
      setError(`Registration failed. Email exists`);
      setLoading(false);
    },
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await registerUser({
        variables: {
          email,
          password,
        },
      });
    } catch (error) {
      console.error('Registration error:', error.message);
      setError('Registration failed. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  const onLoginClick = () => router("/login");

  return (
    <div className="input-container">
      <div className="input-fields">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <span className='redirectButton'>
            Already have an account? <p onClick={onLoginClick}>Login</p>
          </span>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>
      <div className="input-image">
        <img src={bgImg} alt="N/A" />
      </div>

      {loading && <SpinnerComponent />}
    </div>
  );
};

export default Register;
