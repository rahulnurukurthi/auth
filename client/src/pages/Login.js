// Login.js

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import bgImg from '../assets/logo.svg';
import '../styles/formStyles.css';
import SpinnerComponent from '../components/spinnerComponent';

// GraphQL mutation to handle user login
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

  // Function to handle the login process
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

      // Extract the token from the result and store it in local storage
      const token = result && result.data && result.data.loginUser;
      localStorage.setItem('token', token);

      // Redirect the user to the home page after successful login
      router("/home");
    } catch (error) {
      console.error('Login failed:', error.message);
      setError(`Login failed. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle the redirection to the registration page
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
              required
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <span className="redirectButton">
            Create account? <p onClick={onRegisterClick}>Register now</p>
          </span>
        </form>

        {/* Display error message if login fails */}
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="input-image">
        <img src={bgImg} alt="" />
      </div>

      {/* Display loading spinner while waiting for the login process */}
      {loading && <SpinnerComponent />}
    </div>
  );
};

export default Login;
