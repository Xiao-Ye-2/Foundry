import React, { useState, useEffect } from 'react';
import '../styles/UserLogin.css';
import { UserProfile } from "../types";
import UserSignup from './UserSignup';

interface UserLoginProps {
  onLogin: (data: UserProfile) => void;
  onBack: () => void;
  onSignup: () => void;
  userRole: 'employee' | 'employer';
}

const UserLogin: React.FC<UserLoginProps> = ({ onLogin, onBack, onSignup, userRole }) => {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showSignup, setShowSignup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Clear error when inputs change
  useEffect(() => {
    if (error) setError('');
  }, [identifier, password]);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Input validation
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your phone number/email and password');
      return;
    }

    // Test employer handling
    if (userRole === 'employer' && identifier === 'TestEmployer') {
      console.log('Employer login successful');
      onLogin({ userId: 69, userName: 'Frederick Cox', cityName: 'Ottawa', countryName: 'Canada', companyName: 'FedEx' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() }),
      });

      const responseText = await response.text();

      // Try to parse it as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // If it's not JSON, use the text directly as the error message
        if (!response.ok) {
          throw new Error(responseText);
        }
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to login. Please try again.');
      }

      if (data.role && data.role.toLowerCase() !== userRole) {
        throw new Error(`Invalid account type. Please use the ${userRole} login.`);
      }

      console.log('Login successful:', data);
      onLogin(data);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    onSignup();
    setShowSignup(false);
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (error) setError('');
    };

  if (showSignup) {
    return <UserSignup onSignup={handleSignup} onBack={() => setShowSignup(false)} userRole={userRole} />;
  }

  return (
    <div className="user-login-container">
      <h1 className="login-title">
        {userRole === 'employee' ? 'Employee Login' : 'Employer Login'}
      </h1>
      <p className="login-subtitle">
        Please enter your phone number/email and password to continue
      </p>

      <form className="login-form" onSubmit={handleSubmit}>
        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="identifier">Phone Number/Email:</label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={handleInputChange(setIdentifier)}
            placeholder="Enter your phone number or email"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handleInputChange(setPassword)}
            placeholder="Enter your password"
            disabled={isLoading}
            required
          />
        </div>

        <div className="login-actions">
          <button
            type="button"
            className="back-button"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </button>
          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <div className="signup-section">
          <p>Don't have an account?</p>
          <button
            type="button"
            className="signup-button"
            onClick={() => setShowSignup(true)}
            disabled={isLoading}
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserLogin;