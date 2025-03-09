import React, { useState } from 'react';
import '../styles/EmployeeLogin.css';

interface EmployeeLoginProps {
  onLogin: (employeeId: number) => void;
  onBack: () => void;
}

const EmployeeLogin: React.FC<EmployeeLoginProps> = ({ onLogin, onBack }) => {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId.trim()) {
      setError('Please enter your Employee ID');
      return;
    }
    
    const id = parseInt(employeeId);
    if (isNaN(id) || id <= 0) {
      setError('Please enter a valid Employee ID');
      return;
    }
    
    // For demo purposes, we'll accept any valid number as an employee ID
    // In a real app, you would validate this against your database
    onLogin(id);
  };

  return (
    <div className="employee-login-container">
      <h1 className="login-title">Employee Identification</h1>
      <p className="login-subtitle">Please enter your Employee ID to continue</p>
      
      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="login-error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="employeeId">Employee ID:</label>
          <input
            type="number"
            id="employeeId"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Enter your Employee ID"
            min="1"
          />
        </div>
        
        <div className="login-actions">
          <button type="button" className="back-button" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="login-button">
            Continue
          </button>
        </div>
        
        <div className="login-help">
          <p>For demo purposes, you can use any of these Employee IDs:</p>
          <ul>
            <li>1 - John Wang</li>
            <li>3 - Bob Smith</li>
            <li>5 - Mike Brown</li>
            <li>7 - David Lee</li>
            <li>9 - James Taylor</li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default EmployeeLogin; 