import React, { useState, useEffect } from "react";
import JobSearch from "./components/JobSearch";
import RoleSelection from "./components/RoleSelection";
import EmployeeLogin from "./components/EmployeeLogin";
import "./App.css";
import "./styles/EmployeeLogin.css";

interface Job {
  jobId: number;
  title: string;
  description: string;
  minSalary: number;
  maxSalary: number;
  workType: string;
  cityName: string;
  companyName: string;
  isActive: boolean;
  postDate: string;
  countryName?: string;
}

type UserRole = 'employee' | 'employer' | null;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'advanced'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  // Load jobs when the component mounts or when the employee logs in
  useEffect(() => {
    if (employeeId !== null && jobs.length === 0) {
      handleGetJobs();
    }
  }, [employeeId, jobs.length]);

  const handleGetJobs = async () => {
    try {
      setLoading(true);
      setError("");
      console.log('Fetching jobs from:', 'http://localhost:8080/api/jobs');
    
      const response = await fetch('http://localhost:8080/api/jobs', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'omit'  // Added this to avoid CORS credentials issues
      });
      
      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      setJobs(data);
    } catch (error) {
      console.error('Full error object:', error);
      const errorMessage = error instanceof Error 
        ? `Error: ${error.message}` 
        : 'Failed to load jobs. Please check if the backend server is running.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = (role: 'employee' | 'employer') => {
    setUserRole(role);
    // If employer is selected, show a message
    if (role === 'employer') {
      alert('Employer functionality is coming soon!');
      // Reset to employee view after alert
      setUserRole('employee');
    }
  };

  const handleEmployeeLogin = (id: number) => {
    setEmployeeId(id);
    console.log(`Employee logged in with ID: ${id}`);
  };

  const handleSignOut = () => {
    setUserRole(null);
    setEmployeeId(null);
  };

  // If no role is selected, show the role selection screen
  if (userRole === null) {
    return <RoleSelection onSelectRole={handleRoleSelection} />;
  }

  // If employee role is selected but not logged in, show the login screen
  if (userRole === 'employee' && employeeId === null) {
    return <EmployeeLogin onLogin={handleEmployeeLogin} onBack={() => setUserRole(null)} />;
  }

  // Show the job board (employee view)
  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className="header-container">
          <button className="sign-out-button" onClick={handleSignOut}>
            Sign Out
          </button>
          <div className="employee-info">
            <p>Employee ID: {employeeId}</p>
          </div>
          <h1 className="app-title">Job Board</h1>
        </div>
        
        <div className="tab-container">
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
          >
            Browse Jobs
          </button>
          <button 
            onClick={() => setActiveTab('advanced')}
            className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
          >
            Advanced Search
          </button>
        </div>
        
        {activeTab === 'jobs' && (
          <>
            {loading && <div className="loading-indicator">Loading jobs...</div>}
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            {!loading && !error && jobs.length === 0 && (
              <div className="no-jobs-message">
                <p>No jobs available. Please try again later.</p>
                <button className="primary-button" onClick={handleGetJobs}>
                  Refresh Jobs
                </button>
              </div>
            )}
            
            {jobs.length > 0 && (
              <div className="job-list-container">
                {jobs.map(job => (
                  <div key={job.jobId} className="job-card">
                    <div className="job-card-header">
                      <h3 className="job-title">{job.title}</h3>
                      <h4>{job.companyName}</h4>
                    </div>
                    <div className="job-details">
                      <p><strong>Location:</strong> {job.cityName}{job.countryName ? `, ${job.countryName}` : ''}</p>
                      <p><strong>Salary Range:</strong> ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}</p>
                      <p><strong>Work Type:</strong> {job.workType}</p>
                      <p><strong>Posted:</strong> {new Date(job.postDate).toLocaleDateString()}</p>
                    </div>
                    {job.description && (
                      <div className="job-expanded-details">
                        <p className="job-description">{job.description}</p>
                      </div>
                    )}
                    <div className="job-actions">
                      <button 
                        className="apply-button" 
                        onClick={() => alert(`Application functionality coming soon! You would apply for job ID: ${job.jobId}`)}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'advanced' && (
          <JobSearch />
        )}
      </div>
    </div>
  );
};

export default App;
