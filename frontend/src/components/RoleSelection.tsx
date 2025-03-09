import React from 'react';
import '../styles/RoleSelection.css';

interface RoleSelectionProps {
  onSelectRole: (role: 'employee' | 'employer') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  return (
    <div className="role-selection-container">
      <h1 className="role-selection-title">Welcome to Job Board</h1>
      <p className="role-selection-subtitle">Please select your role to continue</p>
      
      <div className="role-cards">
        <div 
          className="role-card employee-card"
          onClick={() => onSelectRole('employee')}
        >
          <div className="role-icon">👨‍💼</div>
          <h2>Job Seeker</h2>
          <p>Find your dream job, apply to positions, and manage your applications</p>
          <button className="role-button">Continue as Job Seeker</button>
        </div>
        
        <div 
          className="role-card employer-card"
          onClick={() => onSelectRole('employer')}
        >
          <div className="role-icon">🏢</div>
          <h2>Employer</h2>
          <p>Post job openings, review applications, and find the perfect candidates</p>
          <button className="role-button">Continue as Employer</button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection; 