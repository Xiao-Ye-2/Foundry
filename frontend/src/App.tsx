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

interface JobApplication {
  applicationId?: number;
  employeeId: number;
  jobId: number;
  applicationDate?: string;
  status?: string;
}

// Transform the data to match our JobApplication interface
interface ApiApplication {
  EmployeeId: number;
  JobId: number;
  ApplyDate: string;
  Status: string;
  JobTitle?: string;
  CompanyName?: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'advanced'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [applyingToJob, setApplyingToJob] = useState<number | null>(null);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationError, setApplicationError] = useState<string>("");
  const [expandedApplications, setExpandedApplications] = useState<number[]>([]);
  const [expandedJobs, setExpandedJobs] = useState<number[]>([]);

  // Load jobs when the component mounts or when the employee logs in
  useEffect(() => {
    if (employeeId !== null && jobs.length === 0) {
      handleGetJobs();
    }
  }, [employeeId, jobs.length]);

  // Load applications when the employee logs in or when the tab changes to 'applications'
  useEffect(() => {
    if (employeeId !== null && activeTab === 'applications') {
      handleGetApplications();
    }
  }, [employeeId, activeTab]);

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
        credentials: 'omit'
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

  const handleGetApplications = async () => {
    if (!employeeId) return;

    try {
      setLoadingApplications(true);
      setApplicationError("");
      
      const response = await fetch(`http://localhost:8080/api/jobs/applications/employee/${employeeId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the data to match our JobApplication interface
      const applications: JobApplication[] = data.map((app: ApiApplication) => ({
        employeeId: app.EmployeeId,
        jobId: app.JobId,
        applicationDate: app.ApplyDate,
        status: app.Status || 'Pending'
      }));
      
      setApplications(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplicationError(error instanceof Error ? error.message : 'Failed to load applications');
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleApplyForJob = async (jobId: number) => {
    if (!employeeId) {
      alert('Please log in to apply for jobs');
      return;
    }

    try {
      setApplyingToJob(jobId);
      
      const response = await fetch('http://localhost:8080/api/jobs/apply', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employeeId,
          jobId: jobId.toString()
        }),
        credentials: 'omit'
      });

      if (response.status === 409) {
        alert('You have already applied for this job');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to submit application: ${response.status} ${response.statusText}`);
      }

      // Add the new application to the state
      const newApplication: JobApplication = {
        employeeId: employeeId,
        jobId: jobId,
        applicationDate: new Date().toISOString(),
        status: 'Pending'
      };
      
      setApplications(prev => [...prev, newApplication]);
      alert(`Application submitted successfully for job: ${jobs.find(job => job.jobId === jobId)?.title}`);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again later.');
    } finally {
      setApplyingToJob(null);
    }
  };

  const hasAppliedForJob = (jobId: number) => {
    return applications.some(app => app.jobId === jobId);
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
    setApplications([]);
  };

  const toggleApplicationDetails = (jobId: number) => {
    setExpandedApplications(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId]
    );
  };

  const isApplicationExpanded = (jobId: number) => expandedApplications.includes(jobId);

  const toggleJobDetails = (jobId: number) => {
    setExpandedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId]
    );
  };

  const isJobExpanded = (jobId: number) => expandedJobs.includes(jobId);

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
            onClick={() => setActiveTab('applications')}
            className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
          >
            My Applications
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
              <>
                <div className="job-results">
                  <h3>Available Jobs ({jobs.length})</h3>
                </div>
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
                      
                      <div className="job-card-actions">
                        <button 
                          className="details-button" 
                          onClick={() => toggleJobDetails(job.jobId)}
                        >
                          {isJobExpanded(job.jobId) ? 'Hide Details' : 'Show Details'}
                        </button>
                        
                        {hasAppliedForJob(job.jobId) ? (
                          <button className="applied-button" disabled>
                            Applied
                          </button>
                        ) : (
                          <button 
                            className="apply-button" 
                            onClick={() => handleApplyForJob(job.jobId)}
                            disabled={applyingToJob === job.jobId}
                          >
                            {applyingToJob === job.jobId ? 'Applying...' : 'Apply Now'}
                          </button>
                        )}
                      </div>
                      
                      {isJobExpanded(job.jobId) && job.description && (
                        <div className="job-expanded-details">
                          <p className="job-description">{job.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
        
        {activeTab === 'applications' && (
          <div className="applications-container">
            <h2>My Applications</h2>
            
            {loadingApplications && <div className="loading-indicator">Loading your applications...</div>}
            
            {applicationError && (
              <div className="error-message">
                {applicationError}
              </div>
            )}
            
            {!loadingApplications && !applicationError && applications.length === 0 && (
              <div className="no-applications-message">
                <p>You haven't applied to any jobs yet.</p>
                <button className="primary-button" onClick={() => setActiveTab('jobs')}>
                  Browse Jobs
                </button>
              </div>
            )}
            
            {!loadingApplications && !applicationError && applications.length > 0 && (
              <div className="applications-list">
                {applications.map((application) => {
                  // Find the corresponding job
                  const job = jobs.find(j => j.jobId === application.jobId);
                  
                  return (
                    <div key={`${application.employeeId}-${application.jobId}`} className="application-card">
                      <div className="application-header">
                        <h3>{job ? job.title : `Job #${application.jobId}`}</h3>
                        <h4>{job ? job.companyName : 'Unknown Company'}</h4>
                      </div>
                      
                      <div className="application-details">
                        <p><strong>Applied On:</strong> {application.applicationDate ? new Date(application.applicationDate).toLocaleDateString() : 'Unknown'}</p>
                        <p><strong>Status:</strong> <span className={`status-${application.status?.toLowerCase()}`}>{application.status || 'Pending'}</span></p>
                      </div>
                      
                      {job && isApplicationExpanded(job.jobId) && (
                        <div className="job-expanded-details">
                          <p><strong>Location:</strong> {job.cityName}{job.countryName ? `, ${job.countryName}` : ''}</p>
                          <p><strong>Salary Range:</strong> ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}</p>
                          <p><strong>Work Type:</strong> {job.workType}</p>
                          <p><strong>Description:</strong></p>
                          <p className="job-description">{job.description}</p>
                        </div>
                      )}
                      
                      {job && (
                        <button 
                          className="view-job-button"
                          onClick={() => toggleApplicationDetails(job.jobId)}
                        >
                          {isApplicationExpanded(job.jobId) ? 'Hide Details' : 'View Job Details'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'advanced' && (
          <JobSearch 
            employeeId={employeeId} 
            onApplyForJob={handleApplyForJob} 
            hasAppliedForJob={hasAppliedForJob}
            applyingToJob={applyingToJob}
          />
        )}
      </div>
    </div>
  );
};

export default App;
