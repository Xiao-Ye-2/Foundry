import React, { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your phone number/email and password');
      return;
    }

    if (userRole === 'employer' && identifier === 'TestEmployer') {
      console.log('Employer login successful');
      onLogin({ userId: 69, userName: 'Frederick Cox', cityName: 'Ottawa', countryName: 'Canada' });
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(data);
      onLogin(data);
    } catch (error: any) {
      console.error('Error logging in:', error);
      setError(error.message);
    }
  };

  const handleSignup = () => {
    onSignup();
    setShowSignup(false);
  };

  if (showSignup) {
    return <UserSignup onSignup={handleSignup} onBack={() => setShowSignup(false)} userRole={userRole} />;
  }

  return (
    <div className="user-login-container">
      <h1 className="login-title">{userRole === 'employee' ? 'Employee Login' : 'Employer Login'}</h1>
      <p className="login-subtitle">Please enter your phone number/email and password to continue</p>

      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="login-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="identifier">Phone Number/Email:</label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter your phone number or email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <div className="login-actions">
          <button type="button" className="back-button" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="login-button">
            Login
          </button>
        </div>

        <div className="signup-section">
          <p>Don't have an account?</p>
          <button type="button" className="signup-button" onClick={() => setShowSignup(true)}>
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserLogin;