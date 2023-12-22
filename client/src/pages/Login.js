// Login.js

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import bgImg from '../assets/logo.svg';
import '../styles/formStyles.css';
import SpinnerComponent from '../components/spinnerComponent';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    loginUser(email: $email, password: $password)
  }
`;

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useNavigate();

  const [loginUser] = useMutation(LOGIN_MUTATION);

  const handleLogin = async () => {
    try {
      setError(null);
      setLoading(true);

      const result = await loginUser({
        variables: {
          email: email,
          password: password,
        },
      });
      const token = result && result.data && result.data.loginUser;
      localStorage.setItem('token', token);
      router("/home");
    } catch (error) {
      console.error('Login failed:', error.message);
      setError(`Login failed. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onRegisterClick = () => router('/register');

  return (
    <div className="input-container">
      <div className="input-fields">
        <h2>Login</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <label>
            Email:
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <span className="redirectButton">
            Create account? <p onClick={onRegisterClick}>Register now</p>
          </span>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="input-image">
        <img src={bgImg} alt="" />
      </div>

      {loading && <SpinnerComponent />}
    </div>
  );
};

export default Login;
